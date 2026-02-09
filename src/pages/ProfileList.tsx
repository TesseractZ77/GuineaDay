import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { AddPigDialog } from '@/components/AddPigDialog';
import { ArrowLeft, Ruler, Heart, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { API_URL } from '@/config';

interface GuineaPig {
    id: number;
    name: string;
    breed?: string;
    color?: string;
    gender?: string;
    photo_url?: string;
}

const ProfileList = () => {
    const navigate = useNavigate();
    const [pigs, setPigs] = useState<GuineaPig[]>([]);

    useEffect(() => {
        fetchPigs();
    }, []);

    const fetchPigs = async () => {
        try {
            const res = await fetch(`${API_URL}/guineapigs/`);
            if (res.ok) {
                const data = await res.json();
                setPigs(data);
            }
        } catch (error) {
            console.error("Failed to fetch profiles:", error);
        }
    };

    const deletePig = async (id: number) => {
        if (!confirm("Are you sure you want to delete this profile? This cannot be undone.")) return;

        try {
            const res = await fetch(`${API_URL}/guineapigs/${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setPigs(pigs.filter(p => p.id !== id));
            } else {
                alert("Failed to delete profile");
            }
        } catch (error) {
            console.error("Error deleting pig:", error);
            alert("Error deleting profile");
        }
    };

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/', { state: { fromTasks: true } })}>
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-display font-bold text-foreground">
                                My Piggies
                            </h1>
                            <p className="text-muted-foreground">Manage profiles and track health</p>
                        </div>
                    </div>
                    <AddPigDialog onPigAdded={fetchPigs} />
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pigs.length === 0 ? (
                        <div className="col-span-full text-center py-20 text-muted-foreground">
                            <Heart className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p>No profiles yet. Add your first guinea pig!</p>
                        </div>
                    ) : (
                        pigs.map(pig => (
                            <motion.div
                                key={pig.id}
                                whileHover={{ y: -5 }}
                                className={`group relative rounded-xl overflow-hidden border border-border/50 shadow-sm bg-card cursor-pointer hover:shadow-md transition-all`}
                                onClick={() => navigate(`/profiles/${pig.id}`)}
                            >
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deletePig(pig.id);
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <div className={`h-32 ${pig.color || 'bg-secondary'} flex items-center justify-center relative overflow-hidden`}>
                                    {pig.photo_url ? (
                                        <img
                                            src={`${API_URL}/${pig.photo_url}`}
                                            alt={pig.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-4xl">🐹</span>
                                    )}
                                </div>

                                <div className="p-4">
                                    <h3 className="text-xl font-bold mb-1">{pig.name}</h3>
                                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                        {pig.breed && <span>{pig.breed}</span>}
                                        {pig.gender && (
                                            <>
                                                <span>•</span>
                                                <span>{pig.gender}</span>
                                            </>
                                        )}
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 text-xs font-medium text-primary">
                                        <Ruler className="w-3 h-3" />
                                        <span>Track Weight</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div >
        </div >
    );
};

export default ProfileList;
