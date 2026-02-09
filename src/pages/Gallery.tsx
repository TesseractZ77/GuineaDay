import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload, Image as ImageIcon, Plus, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { API_URL } from '@/config';

interface Photo {
    id: number;
    filename: string;
    caption?: string;
    guinea_pig_tags?: string;
    album_id?: number;
    created_at: string;
}

const guineaPigs = [
    { id: 'hachi', name: 'Hachi', color: 'bg-orange-100 text-orange-800' },
    { id: 'kui', name: 'Kui', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'nova', name: 'Nova', color: 'bg-gray-100 text-gray-800' },
    { id: 'elmo', name: 'Elmo', color: 'bg-red-100 text-red-800' },
    { id: 'mel', name: 'Mel', color: 'bg-amber-100 text-amber-800' },
    { id: 'haru', name: 'Haru', color: 'bg-stone-100 text-stone-800' },
    { id: 'seven', name: 'Seven', color: 'bg-lime-100 text-lime-800' },
];

const Gallery = () => {
    const navigate = useNavigate();
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Upload State
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadCaption, setUploadCaption] = useState('');
    const [uploadTags, setUploadTags] = useState<string[]>([]);
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

    useEffect(() => {
        fetchPhotos();
    }, [selectedTag]);

    const fetchPhotos = async () => {
        try {
            let url = `${API_URL}/photos/`;
            if (selectedTag) {
                url += `?tag=${selectedTag}`;
            }
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setPhotos(data);
            }
        } catch (error) {
            console.error("Failed to fetch photos:", error);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploadFile(e.target.files[0]);
        }
    };

    const toggleUploadTag = (pigId: string) => {
        if (uploadTags.includes(pigId)) {
            setUploadTags(uploadTags.filter(id => id !== pigId));
        } else {
            setUploadTags([...uploadTags, pigId]);
        }
    };

    const handleUpload = async () => {
        if (!uploadFile) return;

        const formData = new FormData();
        formData.append('file', uploadFile);
        if (uploadCaption) formData.append('caption', uploadCaption);
        if (uploadTags.length > 0) formData.append('guinea_pig_tags', uploadTags.join(','));

        try {
            setIsUploading(true);
            const res = await fetch(`${API_URL}/photos/upload`, {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                // Reset form
                setUploadFile(null);
                setUploadCaption('');
                setUploadTags([]);
                fetchPhotos(); // Refresh grid
            }
        } catch (error) {
            console.error("Upload failed:", error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent, photoId: number) => {
        e.stopPropagation(); // Prevent opening photo if we add that later
        if (!confirm('Are you sure you want to delete this photo?')) return;

        try {
            const res = await fetch(`${API_URL}/photos/${photoId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setPhotos(photos.filter(p => p.id !== photoId));
            }
        } catch (error) {
            console.error("Failed to delete photo:", error);
        }
    };

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/', { state: { fromTasks: true } })}>
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                            Photo Gallery
                        </h1>
                        <p className="text-muted-foreground">Memories of our furry friends</p>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

                    {/* Sidebar / Controls */}
                    <div className="md:col-span-1 space-y-6">
                        {/* Upload Card */}
                        <div className="glass-card p-6 space-y-4">
                            <h2 className="font-bold text-lg flex items-center gap-2">
                                <Upload className="w-4 h-4" /> Upload Photo
                            </h2>

                            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:bg-accent/5 transition-colors cursor-pointer relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                {uploadFile ? (
                                    <div className="text-sm truncate">{uploadFile.name}</div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                        <ImageIcon className="w-8 h-8 opacity-50" />
                                        <span className="text-xs">Click to browse</span>
                                    </div>
                                )}
                            </div>

                            <input
                                type="text"
                                placeholder="Caption..."
                                value={uploadCaption}
                                onChange={(e) => setUploadCaption(e.target.value)}
                                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                            />

                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-2 block">Tag Guinea Pigs:</label>
                                <div className="flex flex-wrap gap-2">
                                    {guineaPigs.map(pig => (
                                        <button
                                            key={pig.id}
                                            onClick={() => toggleUploadTag(pig.id)}
                                            className={`text-[10px] px-2 py-1 rounded-full border transition-all ${uploadTags.includes(pig.id)
                                                ? pig.color + ' border-transparent ring-1 ring-offset-1 ring-primary'
                                                : 'bg-background border-border text-muted-foreground hover:border-primary/50'
                                                }`}
                                        >
                                            {pig.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Button
                                className="w-full"
                                onClick={handleUpload}
                                disabled={!uploadFile || isUploading}
                            >
                                {isUploading ? 'Uploading...' : 'Add Photo'}
                            </Button>
                        </div>

                        {/* Filters */}
                        <div className="space-y-2">
                            <h3 className="font-semibold text-sm text-foreground/80">Filter by Pig</h3>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setSelectedTag(null)}
                                    className={`text-xs px-3 py-1.5 rounded-md transition-colors ${selectedTag === null
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                        }`}
                                >
                                    All
                                </button>
                                {guineaPigs.map(pig => (
                                    <button
                                        key={pig.id}
                                        onClick={() => setSelectedTag(pig.id === selectedTag ? null : pig.id)}
                                        className={`text-xs px-3 py-1.5 rounded-md transition-colors ${selectedTag === pig.id
                                            ? pig.color + ' ring-1 ring-primary' // Active style
                                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                            }`}
                                    >
                                        {pig.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Photo Grid */}
                    <div className="md:col-span-3">
                        {photos.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                                <ImageIcon className="w-16 h-16 opacity-20 mb-4" />
                                <p>No photos yet. Upload some memories!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {photos.map(photo => (
                                    <motion.div
                                        key={photo.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer"
                                        onClick={() => setSelectedPhoto(photo)}
                                    >
                                        <img
                                            src={`${API_URL}/uploads/${photo.filename}`}
                                            alt={photo.caption || 'Guinea Pig Photo'}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                                            <div className="absolute top-2 right-2">
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={(e) => handleDelete(e, photo.id)}
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            {photo.caption && (
                                                <p className="text-white text-sm font-medium truncate">{photo.caption}</p>
                                            )}
                                            {photo.guinea_pig_tags && (
                                                <div className="flex gap-1 mt-1 flex-wrap">
                                                    {photo.guinea_pig_tags.split(',').map(tag => (
                                                        <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm">
                                                            {guineaPigs.find(p => p.id === tag)?.name || tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Lightbox / Enlarged View */}
            {selectedPhoto && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <div className="relative max-w-4xl w-full max-h-screen flex flex-col items-center">
                        <img
                            src={`${API_URL}/uploads/${selectedPhoto.filename}`}
                            alt={selectedPhoto.caption || 'Enlarged photo'}
                            className="w-full h-auto max-h-[85vh] object-contain rounded-md"
                        />
                        {selectedPhoto.caption && (
                            <p className="text-white text-center mt-4 text-lg font-medium">
                                {selectedPhoto.caption}
                            </p>
                        )}
                        <button
                            className="absolute top-4 right-4 text-white hover:text-gray-300 bg-black/50 rounded-full p-2 h-10 w-10 flex items-center justify-center"
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPhoto(null);
                            }}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Gallery;
