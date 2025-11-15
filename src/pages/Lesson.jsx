import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getLesson, getLessons, updateLessonProgress } from '../services/courseService';
import { useAuthStore } from '../stores/authStore';
import ReactPlayer from 'react-player';
import ReactMarkdown from 'react-markdown';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import NotesPanel from '../components/NotesPanel';
import QuizBlock from '../components/QuizBlock';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

const Lesson = () => {
  const { courseId, chapterId, lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [watchDuration, setWatchDuration] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  const [preventSkipping, setPreventSkipping] = useState(false);
  const playerRef = useRef(null);
  const durationIntervalRef = useRef(null);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lessonData, lessonsData] = await Promise.all([
          getLesson(lessonId),
          getLessons(chapterId),
        ]);
        setLesson(lessonData);
        setLessons(lessonsData);
        const index = lessonsData.findIndex(l => l.id === lessonId);
        setCurrentIndex(index >= 0 ? index : 0);
        
        // Check settings for prevent skipping videos
        const { getSettings } = await import('../services/settingsService');
        const settings = await getSettings();
        if (settings?.preventSkippingVideos) {
          setPreventSkipping(true);
        }
      } catch (error) {
        toast.error('Failed to load lesson');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [lessonId, chapterId]);

  // Track video watch duration
  useEffect(() => {
    if (lesson?.videoLink && user) {
      durationIntervalRef.current = setInterval(async () => {
        if (watchDuration > 0 && watchDuration % 10 === 0) {
          // Save every 10 seconds
          try {
            await addDoc(collection(db, 'videoWatchDuration'), {
              userId: user.uid,
              lessonId,
              courseId,
              duration: watchDuration,
              timestamp: new Date().toISOString(),
            });
          } catch (error) {
            console.error('Failed to save watch duration', error);
          }
        }
      }, 10000);

      return () => {
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
        }
      };
    }
  }, [lesson, user, watchDuration, lessonId, courseId]);

  const handleComplete = async () => {
    if (!user) return;
    try {
      await updateLessonProgress(user.uid, lessonId, 100);
      setCompleted(true);
      toast.success('Lesson completed!');
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  const handleVideoProgress = (state) => {
    setVideoProgress(state.played);
    setWatchDuration(state.playedSeconds);
    
    // Prevent skipping if enabled
    if (preventSkipping && state.played < videoProgress - 0.1) {
      // User tried to skip backward
      if (playerRef.current) {
        playerRef.current.seekTo(videoProgress);
      }
    }
  };

  const parseContent = (content) => {
    if (!content) return [];
    
    const blocks = [];
    const quizRegex = /\{\{\s*Quiz\(['"]([^'"]+)['"]\)\s*\}\}/g;
    let lastIndex = 0;
    let match;

    while ((match = quizRegex.exec(content)) !== null) {
      // Add text before quiz
      if (match.index > lastIndex) {
        blocks.push({
          type: 'markdown',
          content: content.substring(lastIndex, match.index),
        });
      }
      
      // Add quiz block
      blocks.push({
        type: 'quiz',
        quizId: match[1],
      });
      
      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      blocks.push({
        type: 'markdown',
        content: content.substring(lastIndex),
      });
    }

    return blocks.length > 0 ? blocks : [{ type: 'markdown', content }];
  };

  const contentBlocks = lesson ? parseContent(lesson.content) : [];
  const hasQuiz = lesson?.quizId || contentBlocks.some(b => b.type === 'quiz');

  const nextLesson = lessons[currentIndex + 1];
  const prevLesson = lessons[currentIndex - 1];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!lesson) {
    return <div className="text-center py-12">Lesson not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to={`/courses/${courseId}`}
          className="flex items-center space-x-2 text-gray-600 hover:text-primary-600"
        >
          <ChevronLeft className="h-5 w-5" />
          <span>Back to Course</span>
        </Link>
        <div className="flex items-center space-x-4">
          {prevLesson && (
            <Link
              to={`/courses/${courseId}/learn/${chapterId}/${prevLesson.id}`}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </Link>
          )}
          {nextLesson && (
            <Link
              to={`/courses/${courseId}/learn/${chapterId}/${nextLesson.id}`}
              className="btn btn-primary flex items-center space-x-2"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Lesson Content */}
      <div className="card">
        <h1 className="text-3xl font-bold mb-6">{lesson.title}</h1>
        
        {lesson.videoLink && (
          <div className="mb-6">
            <ReactPlayer
              ref={playerRef}
              url={lesson.videoLink}
              controls
              width="100%"
              height="500px"
              className="rounded-lg"
              onProgress={handleVideoProgress}
              onDuration={(duration) => {
                // Track total duration
              }}
            />
            {preventSkipping && (
              <p className="text-sm text-gray-500 mt-2">
                ⚠️ Video skipping is disabled. Please watch the complete video.
              </p>
            )}
          </div>
        )}

        {lesson.content && (
          <div className="prose max-w-none mb-6">
            {contentBlocks.map((block, idx) => {
              if (block.type === 'quiz') {
                return (
                  <QuizBlock
                    key={`quiz-${idx}`}
                    quizId={block.quizId}
                    embedded={true}
                    onComplete={(score, total) => {
                      // Optional: Auto-complete lesson if quiz passed
                      if (score >= total * 0.7) {
                        handleComplete();
                      }
                    }}
                  />
                );
              }
              return (
                <ReactMarkdown key={`content-${idx}`}>
                  {block.content}
                </ReactMarkdown>
              );
            })}
          </div>
        )}

        {/* Quiz at end of lesson if specified */}
        {lesson.quizId && !contentBlocks.some(b => b.type === 'quiz') && (
          <QuizBlock
            quizId={lesson.quizId}
            embedded={true}
            onComplete={(score, total) => {
              if (score >= total * 0.7) {
                handleComplete();
              }
            }}
          />
        )}

        {!completed && (
          <button onClick={handleComplete} className="btn btn-primary flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>Mark as Complete</span>
          </button>
        )}
        {completed && (
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span>Lesson Completed</span>
          </div>
        )}
      </div>

      {/* Notes Panel */}
      <NotesPanel lessonId={lessonId} />
    </div>
  );
};

export default Lesson;

