import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, User, Camera } from 'lucide-react';
import Button from './Button';
import showToast from '../../utils/toast';
import { getMediaUrl } from '../../utils/mediaUrl';

/**
 * PhotoUpload Component
 * Handles photo upload with preview
 */
const PhotoUpload = ({ value, onChange, name, label = 'Photo', error }) => {
    // value can be: null, a URL string (existing photo), or a File object (newly selected)
    const getInitialPreview = (v) => {
        if (!v) return null;
        if (v instanceof File) return null; // File object — preview will be set on selection
        if (typeof v === 'string') return getMediaUrl(v);
        return null; // Unexpected type — ignore safely
    };
    const [preview, setPreview] = useState(() => getInitialPreview(value));
    const fileInputRef = useRef(null);

    // Update preview when value prop changes from outside (e.g. async data load in edit mode)
    useEffect(() => {
        // Only update preview from prop if we don't already have a user-selected preview
        // (i.e., if current preview is not a blob/data URL from a fresh selection)
        if (value && typeof value === 'string' && !preview?.startsWith('blob:') && !preview?.startsWith('data:')) {
            setPreview(getMediaUrl(value));
        } else if (!value) {
            setPreview(null);
        }
    }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                showToast.warning('Please select an image file (JPEG, PNG, etc.)');
                return;
            }

            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                showToast.warning('Image size must be less than 2MB');
                return;
            }

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
                // Call onChange with the file object and data URL
                if (onChange) {
                    onChange({
                        target: {
                            name,
                            value: file,
                            preview: reader.result
                        }
                    });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        if (onChange) {
            onChange({
                target: {
                    name,
                    value: null,
                    preview: null
                }
            });
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}

            <div className="flex items-start gap-4">
                {/* Photo Preview */}
                <div className="flex-shrink-0">
                    <div className="relative group">
                        {preview ? (
                            <>
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="h-32 w-32 rounded-lg object-cover border-2 border-gray-300"
                                />
                                {/* Remove Button Overlay */}
                                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        type="button"
                                        onClick={handleRemove}
                                        className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                                        title="Remove photo"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="h-32 w-32 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
                                <User className="h-16 w-16 text-gray-400" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Upload Controls */}
                <div className="flex-1 space-y-3">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            onClick={handleClick}
                            variant={preview ? 'outline' : 'primary'}
                            size="sm"
                        >
                            <Camera className="h-4 w-4 mr-2" />
                            {preview ? 'Change Photo' : 'Upload Photo'}
                        </Button>

                        {preview && (
                            <Button
                                type="button"
                                onClick={handleRemove}
                                variant="danger"
                                size="sm"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Remove
                            </Button>
                        )}
                    </div>

                    <div className="text-xs text-gray-500 space-y-1">
                        <p>• Recommended: 400x400 pixels</p>
                        <p>• Max file size: 2MB</p>
                        <p>• Formats: JPEG, PNG, GIF</p>
                    </div>

                    {error && (
                        <p className="text-sm text-red-600">{error}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PhotoUpload;
