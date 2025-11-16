import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { studentService } from '../services/studentService';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  AcademicCapIcon,
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  IdentificationIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

const QRVerification = () => {
  const [searchParams] = useSearchParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('verifying');
  const [idCardGenerated, setIdCardGenerated] = useState(false);

  // Function to generate and download ID card
  const generateAndDownloadIDCard = (studentData) => {
    // Create a canvas for the ID card
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set ID card dimensions (standard credit card size ratio)
    canvas.width = 600;
    canvas.height = 380;
    
    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add border
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    
    // School Header
    ctx.fillStyle = '#1e40af';
    ctx.fillRect(10, 10, canvas.width - 20, 60);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ILM POSSIBLE SCHOOL', canvas.width / 2, 35);
    ctx.font = '16px Arial';
    ctx.fillText('Student Identification Card', canvas.width / 2, 55);
    
    // Student Photo placeholder
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(30, 90, 120, 150);
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    ctx.strokeRect(30, 90, 120, 150);
    
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PHOTO', 90, 165);
    
    // Student Information
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`${studentData.firstName} ${studentData.lastName}`, 170, 110);
    
    ctx.font = '14px Arial';
    ctx.fillStyle = '#374151';
    ctx.fillText(`Student ID: ${studentData.studentId}`, 170, 135);
    ctx.fillText(`Class: ${studentData.class?.className || 'N/A'}`, 170, 155);
    ctx.fillText(`Roll No: ${studentData.rollNumber || 'N/A'}`, 170, 175);
    
    // Add more student details
    if (studentData.dateOfBirth) {
      ctx.fillText(`DOB: ${new Date(studentData.dateOfBirth).toLocaleDateString()}`, 170, 195);
    }
    if (studentData.gender) {
      ctx.fillText(`Gender: ${studentData.gender}`, 170, 215);
    }
    if (studentData.phone) {
      ctx.fillText(`Phone: ${studentData.phone}`, 170, 235);
    }
    if (studentData.email) {
      ctx.fillText(`Email: ${studentData.email}`, 170, 255);
    }
    
    // QR Code Section
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SCAN FOR VERIFICATION', 450, 280);
    
    // Create QR code for the ID card
    const qrContainer = document.createElement('div');
    qrContainer.innerHTML = `
      <svg width="140" height="140" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
        <rect width="256" height="256" fill="white"/>
        <text x="128" y="128" text-anchor="middle" font-size="12" fill="black">QR Code</text>
        <text x="128" y="145" text-anchor="middle" font-size="8" fill="black">${studentData.studentId}</text>
      </svg>
    `;
    
    const svgElement = qrContainer.querySelector('svg');
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const img = new Image();
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    img.onload = function() {
      // Draw QR code placeholder
      ctx.drawImage(img, 380, 300, 140, 140);
      
      // Valid Until date
      ctx.fillStyle = '#6b7280';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      const validDate = new Date();
      validDate.setFullYear(validDate.getFullYear() + 1);
      ctx.fillText(`Valid Until: ${validDate.toLocaleDateString()}`, 30, 350);
      
      // Signature line
      ctx.strokeStyle = '#9ca3af';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(400, 350);
      ctx.lineTo(570, 350);
      ctx.stroke();
      
      ctx.fillStyle = '#6b7280';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Principal Signature', 485, 365);
      
      // Convert canvas to blob and download
      canvas.toBlob(function(blob) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${studentData.studentId}_ID_Card.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        URL.revokeObjectURL(link.href);
        setIdCardGenerated(true);
      }, 'image/png');
    };
    
    img.src = url;
  };

  useEffect(() => {
    const verifyStudent = async () => {
      try {
        // Get QR data from URL parameters
        const qrData = searchParams.get('data');
        
        if (!qrData) {
          setError('No QR data found');
          setVerificationStatus('error');
          setLoading(false);
          return;
        }

        // Parse QR data
        let parsedData;
        try {
          parsedData = JSON.parse(decodeURIComponent(qrData));
        } catch (parseError) {
          setError('Invalid QR code format');
          setVerificationStatus('error');
          setLoading(false);
          return;
        }

        // Get student by ID
        const studentData = await studentService.getStudentById(parsedData.studentId);
        
        // Verify the data matches
        if (studentData.firstName === parsedData.name.split(' ')[0] && 
            studentData.studentId === parsedData.studentId) {
          setStudent(studentData);
          setVerificationStatus('verified');
          
          // Automatically generate and download ID card
          setTimeout(() => {
            generateAndDownloadIDCard(studentData);
          }, 1000);
        } else {
          setError('Student data mismatch');
          setVerificationStatus('invalid');
        }
      } catch (err) {
        setError('Student not found or verification failed');
        setVerificationStatus('invalid');
      } finally {
        setLoading(false);
      }
    };

    verifyStudent();
  }, [searchParams]);

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'verified':
        return <CheckCircleIcon className="w-16 h-16 text-green-500" />;
      case 'invalid':
        return <XCircleIcon className="w-16 h-16 text-red-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-16 h-16 text-yellow-500" />;
      default:
        return <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>;
    }
  };

  const getStatusText = () => {
    switch (verificationStatus) {
      case 'verified':
        return 'Student Verified Successfully';
      case 'invalid':
        return 'Verification Failed';
      case 'error':
        return 'Verification Error';
      default:
        return 'Verifying...';
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'verified':
        return 'text-green-600';
      case 'invalid':
        return 'text-red-600';
      case 'error':
        return 'text-yellow-600';
      default:
        return 'text-blue-600';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying QR Code...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">QR Code Verification</h1>
            <p className="text-gray-600">ILM Possible School - Student Identity Verification</p>
          </div>

          {/* Verification Status */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <div className="text-center mb-6">
              {getStatusIcon()}
              <h2 className={`text-2xl font-semibold mt-4 ${getStatusColor()}`}>
                {getStatusText()}
              </h2>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* ID Card Download Notification */}
            {verificationStatus === 'verified' && idCardGenerated && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                <div className="flex items-center">
                  <DocumentArrowDownIcon className="w-5 h-5 text-green-600 mr-2" />
                  <p className="text-green-800">ID Card has been downloaded automatically!</p>
                </div>
              </div>
            )}

            {/* Student Details (only show if verified) */}
            {verificationStatus === 'verified' && student && (
              <div className="space-y-6">
                {/* Student Card */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-4">
                        <IdentificationIcon className="w-8 h-8 text-blue-600 mr-3" />
                        <h3 className="text-xl font-semibold text-gray-900">Student Information</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <UserIcon className="w-5 h-5 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">Name:</span>
                          <span className="ml-2 font-medium">{student.firstName} {student.lastName}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <AcademicCapIcon className="w-5 h-5 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">Student ID:</span>
                          <span className="ml-2 font-medium">{student.studentId}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <AcademicCapIcon className="w-5 h-5 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">Class:</span>
                          <span className="ml-2 font-medium">{student.class?.className || 'N/A'}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <CalendarIcon className="w-5 h-5 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">Roll No:</span>
                          <span className="ml-2 font-medium">{student.rollNumber || 'N/A'}</span>
                        </div>
                        
                        {student.dateOfBirth && (
                          <div className="flex items-center">
                            <CalendarIcon className="w-5 h-5 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">DOB:</span>
                            <span className="ml-2 font-medium">
                              {new Date(student.dateOfBirth).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        
                        {student.gender && (
                          <div className="flex items-center">
                            <UserIcon className="w-5 h-5 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">Gender:</span>
                            <span className="ml-2 font-medium">{student.gender}</span>
                          </div>
                        )}
                        
                        {student.phone && (
                          <div className="flex items-center">
                            <PhoneIcon className="w-5 h-5 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">Phone:</span>
                            <span className="ml-2 font-medium">{student.phone}</span>
                          </div>
                        )}
                        
                        {student.email && (
                          <div className="flex items-center">
                            <EnvelopeIcon className="w-5 h-5 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">Email:</span>
                            <span className="ml-2 font-medium">{student.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Manual Download Button */}
                <div className="text-center">
                  <Button
                    onClick={() => generateAndDownloadIDCard(student)}
                    icon={DocumentArrowDownIcon}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Download ID Card Again
                  </Button>
                </div>

                {/* Verification Timestamp */}
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600">
                    Verified on: {new Date().toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    This verification is valid for identity confirmation purposes only
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4 mt-6">
              <Button
                onClick={() => window.history.back()}
                className="bg-gray-600 hover:bg-gray-700"
              >
                Go Back
              </Button>
              {verificationStatus === 'verified' && (
                <Button
                  onClick={() => window.print()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Print Verification
                </Button>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500">
            <p>© 2024 ILM Possible School - Student Verification System</p>
            <p className="mt-1">For official use only | Unauthorized access prohibited</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default QRVerification;
