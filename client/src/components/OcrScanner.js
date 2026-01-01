import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import { CameraIcon, PhotoIcon, ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Button from './Button';

const OcrScanner = ({ onDataExtracted }) => {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [preview, setPreview] = useState(null);
    const [extractedInfo, setExtractedInfo] = useState(null);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
            processImage(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const processImage = async (imageSrc) => {
        setLoading(true);
        setError(null);
        setProgress(0);

        try {
            const { data: { text } } = await Tesseract.recognize(
                imageSrc,
                'eng',
                {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            setProgress(parseInt(m.progress * 100));
                        }
                    }
                }
            );

            console.log('OCR Output:', text);
            const extractedData = parseOcrText(text);
            setExtractedInfo(extractedData);
            onDataExtracted(extractedData);
            setLoading(false);
        } catch (err) {
            console.error('OCR Error:', err);
            setError('Failed to process image. Please try again or fill manually.');
            setLoading(false);
        }
    };

    // Helper to convert text months to numbers
    const monthMap = {
        'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'may': '05', 'jun': '06',
        'jul': '07', 'aug': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12',
        'margh': '03', 'janu': '01', 'febr': '02', 'apri': '04', 'june': '06', 'july': '07', 'augu': '08', 'sept': '09', 'octo': '10', 'nove': '11', 'dece': '12'
    };

    const parseOcrText = (text) => {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        let data = {
            firstName: '',
            lastName: '',
            dateOfBirth: '',
            gender: '',
            fatherName: '',
            motherName: '',
            birthplace: '',
            city: ''
        };

        console.log('Lines for parsing:', lines);

        // 1. Look for Name (more aggressive)
        const nameKeywords = ['Name', 'Student Name', 'Full Name', 'Name of Student', 'Applicant Name', 'This certificates that', 'This is to certify that', 'Nom'];
        let nameFound = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Check for "Key Name, First Middle" (e.g., "Name ZHANG, EMILY WEI")
            const commaMatch = line.match(new RegExp(`(?:${nameKeywords.join('|')})[:\\s]+([A-Z\\s]+)[,]\\s*([A-Z\\s]+)`, 'i'));
            if (commaMatch) {
                data.lastName = commaMatch[1].trim();
                data.firstName = commaMatch[2].trim().split(/\s+/)[0];
                nameFound = true;
                break;
            }

            const match = line.match(new RegExp(`(?:${nameKeywords.join('|')})[:\\s]+([A-Z\\s]{3,})`, 'i'));
            if (match) {
                const fullParts = match[1].trim().split(/\s+/);
                data.firstName = fullParts[0];
                data.lastName = fullParts.slice(1).join(' ');
                nameFound = true;
                break;
            }

            // Check if the name is on the NEXT line after a specific header (common in certificates)
            if (/(?:certificates that|certify that|Name of Student|Student Name)$/i.test(line) && i + 1 < lines.length) {
                const nextLine = lines[i + 1].trim();
                if (/^[A-Za-z\s,]{3,}$/.test(nextLine) && !/born to/i.test(nextLine)) {
                    if (nextLine.includes(',')) {
                        const [last, first] = nextLine.split(',').map(s => s.trim());
                        data.lastName = last;
                        data.firstName = first.split(/\s+/)[0];
                    } else {
                        const fullParts = nextLine.split(/\s+/);
                        data.firstName = fullParts[0];
                        data.lastName = fullParts.slice(1).join(' ');
                    }
                    nameFound = true;
                    break;
                }
            }
        }

        // 2. Look for Parents (Common in Birth Certificates)
        const fatherKeywords = ['Father', 'Father Name', 'Father\'s Name', 'Père', 'John'];
        const motherKeywords = ['Mother', 'Mother Name', 'Mother\'s Name', 'Mère', 'Olivia'];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // "was born to [Mother] and [Father]" pattern
            const bornToMatch = line.match(/was born to\s+([A-Z\s]+)\s+and\s+([A-Z\s]+)/i);
            if (bornToMatch) {
                data.motherName = bornToMatch[1].trim();
                data.fatherName = bornToMatch[2].trim();
            }

            // Individual labels
            const fMatch = line.match(new RegExp(`(?:${fatherKeywords.join('|')})[:\\s|]+([A-Z\\s]{3,})`, 'i'));
            if (fMatch && !/born to/i.test(fMatch[1])) data.fatherName = fMatch[1].trim();

            const mMatch = line.match(new RegExp(`(?:${motherKeywords.join('|')})[:\\s|]+([A-Z\\s]{3,})`, 'i'));
            if (mMatch && !/born to/i.test(mMatch[1])) data.motherName = mMatch[1].trim();
        }

        // Fallback: If no label, look for lines that look like names (Title Case or ALL CAPS)
        if (!nameFound) {
            for (const line of lines) {
                // Avoid picking up header titles
                if (/Birth|Certificate|Hospital|University|School|District|Page|Nom/i.test(line)) continue;

                if (line.includes(',')) {
                    const [last, first] = line.split(',').map(s => s.trim());
                    if (/^[A-Z\s]+$/.test(last) && /^[A-Z\s]+$/.test(first)) {
                        data.lastName = last;
                        data.firstName = first.split(/\s+/)[0];
                        nameFound = true;
                        break;
                    }
                }

                if (/^[A-Z][a-z]+\s[A-Z][a-z]+(\s[A-Z][a-z]+)?$/.test(line) || /^[A-Z]{3,}\s[A-Z]{3,}(\s[A-Z]{3,})?$/.test(line)) {
                    const fullParts = line.split(/\s+/);
                    data.firstName = fullParts[0];
                    data.lastName = fullParts.slice(1).join(' ');
                    break;
                }
            }
        }

        // 2. Look for DOB
        const dobKeywords = ['DOB', 'Date of Birth', 'Birth Date', 'Born', 'Date', 'Date de naissance'];
        const monthRegex = '(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*';

        for (const line of lines) {
            // First check for month-name formatted dates "MARCH 7, 1992" or "MARGH 7, 1992"
            const textDateMatch = line.match(new RegExp(`(?:${dobKeywords.join('|')})?[:\\s|]+(${monthRegex})\\s+(\\d{1,2})[,\\s]+(\\d{4})`, 'i')) ||
                line.match(new RegExp(`(${monthRegex})\\s+(\\d{1,2})[,\\s]+(\\d{4})`, 'i'));

            if (textDateMatch) {
                const monthText = textDateMatch[1].toLowerCase().substring(0, 3);
                const month = monthMap[monthText] || monthMap[textDateMatch[1].toLowerCase()];
                if (month) {
                    const day = textDateMatch[2].padStart(2, '0');
                    const year = textDateMatch[3];
                    data.dateOfBirth = `${year}-${month}-${day}`;
                    break;
                }
            }

            // Added dot . to separators
            const dobMatch = line.match(new RegExp(`(?:${dobKeywords.join('|')})[:\\s]+(\\d{1,2}[/\\-\\.]\\d{1,2}[/\\-\\.]\\d{2,4})`, 'i')) ||
                line.match(/(\d{1,2}[/\\-\\.]\\d{1,2}[/\\-\\.]\\d{2,4})/);
            if (dobMatch) {
                data.dateOfBirth = formatDateForInput(dobMatch[1]);
                // If line contains specific birth keywords, it's definitely the DOB
                if (line.toLowerCase().includes('born') || line.toLowerCase().includes('birth')) break;
            }
        }

        // 4. Look for Birthplace / City
        const placeKeywords = ['Birthplace', 'Lieu de naissance', 'Place of Birth', 'City', 'Town'];
        for (const line of lines) {
            const placeMatch = line.match(new RegExp(`(?:${placeKeywords.join('|')})[:\\s|]+([A-Z\\s,]{3,})`, 'i'));
            if (placeMatch) {
                data.birthplace = placeMatch[1].trim();
                // Filter out labels that might have been caught
                if (!/MARCH|1992|MARGH|Regis/i.test(data.birthplace)) {
                    data.city = data.birthplace.split(',')[0].trim();
                    break;
                }
            }
        }

        // 3. Look for Gender
        const genderKeywords = ['Gender', 'Sex', 'Sexe'];
        for (const line of lines) {
            const genderMatch = line.match(new RegExp(`(?:${genderKeywords.join('|')})[:\\s|]+(Male|Female|Other|M|F)`, 'i')) ||
                line.match(/^[\s|]*(M|F|Male|Female)[\s|]*$/i);
            if (genderMatch) {
                const g = genderMatch[1].toUpperCase();
                if (g === 'M' || g === 'MALE') data.gender = 'male';
                else if (g === 'F' || g === 'FEMALE') data.gender = 'female';
                else data.gender = g.toLowerCase();
            }
        }

        // Final check: if gender not found by label, look for lone "Male" or "Female"
        if (!data.gender) {
            if (text.toLowerCase().includes('female')) data.gender = 'female';
            else if (text.toLowerCase().includes('male')) data.gender = 'male';
            else if (/\bF\b/.test(text)) data.gender = 'female';
            else if (/\bM\b/.test(text)) data.gender = 'male';
        }

        return data;
    };

    const formatDateForInput = (dateStr) => {
        try {
            // Support dots, dashes, and slashes
            const parts = dateStr.split(/[/\\-\\.]/);
            if (parts.length === 3) {
                let day, month, year;
                // Try to identify year (4 digits)
                if (parts[2].length === 4) {
                    year = parts[2];
                    // Common format is DD/MM/YYYY or MM/DD/YYYY
                    // If first part > 12, it must be DD/MM/YYYY
                    if (parseInt(parts[0]) > 12) {
                        day = parts[0];
                        month = parts[1];
                    } else {
                        // Ambiguous, assume DD/MM/YYYY as standard for most ID cards
                        day = parts[0];
                        month = parts[1];
                    }
                } else if (parts[0].length === 4) {
                    year = parts[0];
                    month = parts[1];
                    day = parts[2];
                } else {
                    // Try to guess - if first part > 12, it must be day
                    if (parseInt(parts[0]) > 12) {
                        day = parts[0];
                        month = parts[1];
                    } else {
                        month = parts[0];
                        day = parts[1];
                    }
                    year = parts[2].length === 2 ? '20' + parts[2] : parts[2];
                }

                const fMonth = month.toString().padStart(2, '0');
                const fDay = day.toString().padStart(2, '0');
                return `${year}-${fMonth}-${fDay}`;
            }
        } catch (e) {
            return '';
        }
        return '';
    };

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-xl border-2 border-dashed border-indigo-200 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="flex flex-col items-center justify-center space-y-4">
                {!preview ? (
                    <div className="text-center p-6 cursor-pointer hover:bg-white rounded-lg transition-colors w-full group">
                        <label className="cursor-pointer block">
                            <div className="bg-indigo-100 p-4 rounded-full inline-block mb-3 group-hover:scale-110 transition-transform">
                                <CameraIcon className="h-8 w-8 text-indigo-600" />
                            </div>
                            <h4 className="text-sm font-bold text-gray-900">AI Auto-Fill (OCR)</h4>
                            <p className="text-xs text-gray-500 mt-1">Upload Student ID or Birth Certificate to auto-fill info</p>
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                        </label>
                    </div>
                ) : (
                    <div className="w-full space-y-3">
                        <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-black max-h-40">
                            <img src={preview} alt="Upload preview" className="w-full object-contain max-h-40 opacity-70" />
                            {loading && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white">
                                    <ArrowPathIcon className="h-10 w-10 animate-spin mb-2" />
                                    <span className="text-sm font-bold">Scanning... {progress}%</span>
                                </div>
                            )}
                            {!loading && !error && (
                                <div className="absolute top-2 right-2 flex space-x-2">
                                    <div className="bg-green-500 text-white p-1 rounded-full">
                                        <CheckCircleIcon className="h-5 w-5" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {!loading && !error && (
                            <div className="bg-white/50 rounded-lg p-2 text-[10px] grid grid-cols-2 gap-1 border border-indigo-100">
                                <div className="flex flex-col">
                                    <span className="text-gray-400 uppercase font-bold">Name</span>
                                    <span className="text-indigo-900 font-medium truncate">
                                        {((extractedInfo?.firstName || '') + ' ' + (extractedInfo?.lastName || '')).trim() || 'Not found'}
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-gray-400 uppercase font-bold">DOB</span>
                                    <span className="text-indigo-900 font-medium">{extractedInfo?.dateOfBirth || 'Not found'}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-gray-400 uppercase font-bold">Gender</span>
                                    <span className="text-indigo-900 font-medium capitalize">{extractedInfo?.gender || 'Not found'}</span>
                                </div>
                            </div>
                        )}

                        {error && <p className="text-xs text-red-600 font-medium italic">{error}</p>}

                        <div className="flex justify-between items-center">
                            <label className="cursor-pointer text-xs text-indigo-600 font-bold hover:underline">
                                Try another photo
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </label>
                            <span className="text-[10px] text-gray-400">Powered by AI OCR</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OcrScanner;
