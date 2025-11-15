import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { getCertificates } from '../services/certificateService';
import { Award, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

const Certificates = () => {
  const { user } = useAuthStore();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

  const loadCertificates = async () => {
    try {
      const data = await getCertificates(user.uid);
      setCertificates(data);
    } catch (error) {
      console.error('Failed to load certificates:', error);
      // Set empty array on error to prevent UI issues
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };
    loadCertificates();
  }, [user]);

  const downloadCertificate = async (certificate) => {
    try {
      const element = document.getElementById(`certificate-${certificate.id}`);
      if (!element) {
        toast.error('Certificate element not found');
        return;
      }

      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageWidth;
      const pdfHeight = pdf.internal.pageHeight;
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`certificate-${certificate.id}.pdf`);
      
      toast.success('Certificate downloaded');
    } catch (error) {
      toast.error('Failed to download certificate');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please login to view your certificates</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Certificates</h1>

      {certificates.length === 0 ? (
        <div className="card text-center py-12">
          <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">You don't have any certificates yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {certificates.map((certificate) => (
            <div key={certificate.id} className="card">
              <div
                id={`certificate-${certificate.id}`}
                className="bg-white border-4 border-primary-600 p-8 text-center"
                style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
              >
                <h2 className="text-3xl font-bold mb-4">Certificate of Completion</h2>
                <p className="text-lg mb-6">This is to certify that</p>
                <h3 className="text-2xl font-bold mb-6 border-b-2 border-primary-600 pb-4 inline-block">
                  {certificate.studentName || 'Student Name'}
                </h3>
                <p className="text-lg mb-2">has successfully completed</p>
                <h4 className="text-xl font-semibold mb-6">{certificate.courseName}</h4>
                <div className="mt-8 flex justify-between">
                  <div className="text-center">
                    <div className="border-t-2 border-gray-400 pt-2">
                      <p className="font-semibold">Instructor</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="border-t-2 border-gray-400 pt-2">
                      <p className="font-semibold">Date</p>
                      <p>{new Date(certificate.issuedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => downloadCertificate(certificate)}
                className="mt-4 btn btn-primary w-full flex items-center justify-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Download PDF</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Certificates;

