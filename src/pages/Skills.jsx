import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { getAllSkills, getUserSkills, addUserSkill, removeUserSkill, createSkill } from '../services/skillsService';
import { Plus, X, Award, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const Skills = () => {
  const { user, userData } = useAuthStore();
  const [allSkills, setAllSkills] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [proficiency, setProficiency] = useState('beginner');
  const isAdmin = userData?.role === 'admin' || userData?.role === 'instructor';

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const [skills, mySkills] = await Promise.all([
          getAllSkills(),
          user ? getUserSkills(user.uid) : Promise.resolve([]),
        ]);
        setAllSkills(skills);
        setUserSkills(mySkills);
      } catch (error) {
        console.error('Failed to load skills:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, [user]);

  const handleAddSkill = async (skillId) => {
    if (!user) {
      toast.error('Please login to add skills');
      return;
    }
    try {
      const result = await addUserSkill(user.uid, skillId, proficiency);
      if (result.success) {
        const updatedSkills = await getUserSkills(user.uid);
        setUserSkills(updatedSkills);
        toast.success('Skill added!');
      }
    } catch (error) {
      toast.error('Failed to add skill');
    }
  };

  const handleRemoveSkill = async (userSkillId) => {
    try {
      const result = await removeUserSkill(userSkillId);
      if (result.success) {
        const updatedSkills = await getUserSkills(user.uid);
        setUserSkills(updatedSkills);
        toast.success('Skill removed!');
      }
    } catch (error) {
      toast.error('Failed to remove skill');
    }
  };

  const handleCreateSkill = async (e) => {
    e.preventDefault();
    try {
      const result = await createSkill({ name: newSkillName });
      if (result.success) {
        const skills = await getAllSkills();
        setAllSkills(skills);
        setNewSkillName('');
        setShowAddSkill(false);
        toast.success('Skill created!');
      }
    } catch (error) {
      toast.error('Failed to create skill');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const mySkillIds = new Set(userSkills.map(us => us.skillId));
  const availableSkills = allSkills.filter(s => !mySkillIds.has(s.id));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center space-x-2">
          <Award className="h-6 w-6 md:h-8 md:w-8 text-primary-600" />
          <span>Skills</span>
        </h1>
        {isAdmin && (
          <button
            onClick={() => setShowAddSkill(!showAddSkill)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Skill</span>
          </button>
        )}
      </div>

      {/* Create Skill Form (Admin) */}
      {isAdmin && showAddSkill && (
        <div className="card">
          <form onSubmit={handleCreateSkill} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skill Name
              </label>
              <input
                type="text"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                className="input"
                placeholder="e.g., JavaScript, Python, Design"
                required
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn btn-primary">
                Create Skill
              </button>
              <button
                type="button"
                onClick={() => setShowAddSkill(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* My Skills */}
      {user && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">My Skills</h2>
          {userSkills.length === 0 ? (
            <p className="text-gray-600">You haven't added any skills yet.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {userSkills.map((userSkill) => {
                const skill = allSkills.find(s => s.id === userSkill.skillId);
                if (!skill) return null;
                return (
                  <div
                    key={userSkill.id}
                    className="flex items-center space-x-2 bg-primary-100 text-primary-800 px-4 py-2 rounded-full"
                  >
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-xs bg-primary-200 px-2 py-1 rounded">
                      {userSkill.proficiency || 'beginner'}
                    </span>
                    <button
                      onClick={() => handleRemoveSkill(userSkill.id)}
                      className="ml-2 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Available Skills */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Available Skills</h2>
        {availableSkills.length === 0 ? (
          <p className="text-gray-600">No skills available.</p>
        ) : (
          <div className="space-y-3">
            {availableSkills.map((skill) => (
              <div
                key={skill.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <Award className="h-5 w-5 text-primary-600" />
                  <span className="font-medium">{skill.name}</span>
                </div>
                {user && (
                  <div className="flex items-center space-x-3">
                    <select
                      value={proficiency}
                      onChange={(e) => setProficiency(e.target.value)}
                      className="input text-sm w-32"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                    <button
                      onClick={() => handleAddSkill(skill.id)}
                      className="btn btn-primary text-sm"
                    >
                      Add Skill
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Skills;

