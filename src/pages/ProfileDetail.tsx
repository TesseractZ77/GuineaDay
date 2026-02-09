import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Scale, Ruler, Heart, Utensils, Calendar, Trash2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_URL = 'http://localhost:8000';

interface GuineaPig {
    id: number;
    name: string;
    birth_date?: string;
    gender?: string;
    breed?: string;
    color?: string;
    adoption_date?: string;
    personality_notes?: string;
    food_preferences?: string;
    photo_url?: string;
}

interface WeightLog {
    id: number;
    date: string;
    weight_grams: number;
    notes?: string;
}

const ProfileDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pig, setPig] = useState<GuineaPig | null>(null);
    const [weights, setWeights] = useState<WeightLog[]>([]);
    const [newWeight, setNewWeight] = useState('');
    const [weightNote, setWeightNote] = useState('');

    // Editing State
    const [isEditingPersonality, setIsEditingPersonality] = useState(false);
    const [tempPersonality, setTempPersonality] = useState("");
    const [isEditingFood, setIsEditingFood] = useState(false);
    const [tempFood, setTempFood] = useState("");

    // Vitals Editing State
    const [isEditingVitals, setIsEditingVitals] = useState(false);
    const [tempVitals, setTempVitals] = useState({
        gender: "",
        breed: "",
        birth_date: "",
    });

    const handleUpdateProfile = async (field: keyof GuineaPig, value: string) => {
        if (!pig) return;

        try {
            const res = await fetch(`${API_URL}/guineapigs/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...pig,
                    [field]: value
                }),
            });

            if (res.ok) {
                const updatedPig = await res.json();
                setPig(updatedPig);
                setIsEditingPersonality(false);
                setIsEditingFood(false);
            }
        } catch (error) {
            console.error(`Failed to update ${field}:`, error);
        }
    };

    const handleUpdateVitals = async () => {
        if (!pig) return;

        try {
            const res = await fetch(`${API_URL}/guineapigs/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...pig,
                    gender: tempVitals.gender,
                    breed: tempVitals.breed,
                    birth_date: tempVitals.birth_date || null
                }),
            });

            if (res.ok) {
                const updatedPig = await res.json();
                setPig(updatedPig);
                setIsEditingVitals(false);
            }
        } catch (error) {
            console.error("Failed to update vitals:", error);
        }
    };

    useEffect(() => {
        if (id) {
            fetchPig();
            fetchWeights();
        }
    }, [id]);

    const fetchPig = async () => {
        try {
            const res = await fetch(`${API_URL}/guineapigs/${id}`);
            if (res.ok) {
                const data = await res.json();
                setPig(data);
            }
        } catch (error) {
            console.error("Failed to fetch pig details:", error);
        }
    };

    const fetchWeights = async () => {
        try {
            const res = await fetch(`${API_URL}/guineapigs/${id}/weights`);
            if (res.ok) {
                const data = await res.json();
                setWeights(data.reverse()); // Reverse for chart order (oldest first)? Actually backend sorts desc.
                // For chart we might want ascending date.
                // Let's store desc for list, and reverse for chart.
                setWeights(data);
            }
        } catch (error) {
            console.error("Failed to fetch weights:", error);
        }
    };

    const handleAddWeight = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/guineapigs/${id}/weights`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    weight_grams: parseInt(newWeight),
                    notes: weightNote
                }),
            });
            if (res.ok) {
                setNewWeight('');
                setWeightNote('');
                fetchWeights();
            }
        } catch (error) {
            console.error("Failed to add weight:", error);
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`${API_URL}/guineapigs/${id}/photo`, {
                method: 'POST',
                body: formData,
            });
            if (res.ok) {
                fetchPig(); // Refresh to show new photo
            }
        } catch (error) {
            console.error("Failed to upload photo:", error);
        }
    };

    const handleDeleteWeight = async (weightId: number) => {
        if (!confirm("Are you sure you want to delete this weight log?")) return;
        try {
            const res = await fetch(`${API_URL}/weights/${weightId}`, { method: 'DELETE' });
            if (res.ok) {
                fetchWeights();
            }
        } catch (error) {
            console.error("Failed to delete weight:", error);
        }
    };

    if (!pig) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    const chartData = [...weights].reverse().map(w => ({
        date: new Date(w.date).toLocaleDateString(),
        weight: w.weight_grams
    }));

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button onClick={() => navigate('/profiles')} className="bg-transparent hover:bg-muted p-2 h-10 w-10">
                        <ArrowLeft className="h-6 w-6 text-foreground" />
                    </Button>
                    <h1 className="text-3xl font-display font-bold">{pig.name}</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Sidebar / Photo Card */}
                    <div className="space-y-6">
                        <div className={`aspect-square rounded-2xl overflow-hidden ${pig.color || 'bg-secondary'} flex items-center justify-center border border-border/50 shadow-sm relative group`}>
                            {pig.photo_url ? (
                                <img
                                    src={`${API_URL}/${pig.photo_url}`}
                                    alt={pig.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-8xl">🐹</span>
                            )}

                            {/* Upload Overlay */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <label className="cursor-pointer text-white flex flex-col items-center gap-2">
                                    <span className="text-sm font-medium">Change Photo</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handlePhotoUpload}
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="bg-card rounded-xl p-6 border border-border/50 shadow-sm relative group">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <Heart className="w-5 h-5 text-primary" />
                                    Vitals
                                </h3>
                                {!isEditingVitals && (
                                    <Button
                                        onClick={() => {
                                            setTempVitals({
                                                gender: pig.gender || "",
                                                breed: pig.breed || "",
                                                birth_date: pig.birth_date ? pig.birth_date.split('T')[0] : "",
                                            });
                                            setIsEditingVitals(true);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 px-3 text-xs"
                                    >
                                        Edit
                                    </Button>
                                )}
                            </div>

                            {isEditingVitals ? (
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground">Gender</label>
                                        <input
                                            value={tempVitals.gender}
                                            onChange={(e) => setTempVitals({ ...tempVitals, gender: e.target.value })}
                                            className="w-full px-2 py-1 rounded border border-input bg-background text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground">Breed</label>
                                        <input
                                            value={tempVitals.breed}
                                            onChange={(e) => setTempVitals({ ...tempVitals, breed: e.target.value })}
                                            className="w-full px-2 py-1 rounded border border-input bg-background text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground">Birth Day</label>
                                        <input
                                            type="date"
                                            value={tempVitals.birth_date}
                                            onChange={(e) => setTempVitals({ ...tempVitals, birth_date: e.target.value })}
                                            className="w-full px-2 py-1 rounded border border-input bg-background text-sm"
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2 mt-2">
                                        <Button onClick={() => setIsEditingVitals(false)} className="h-7 px-2 text-xs bg-transparent text-foreground hover:bg-muted">Cancel</Button>
                                        <Button onClick={handleUpdateVitals} className="h-7 px-2 text-xs">Save</Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Gender</span>
                                        <span className="font-medium">{pig.gender || 'Unknown'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Breed</span>
                                        <span className="font-medium">{pig.breed || 'Unknown'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Age</span>
                                        <span className="font-medium">
                                            {pig.birth_date ? (() => {
                                                const birth = new Date(pig.birth_date);
                                                const now = new Date();
                                                let years = now.getFullYear() - birth.getFullYear();
                                                let months = now.getMonth() - birth.getMonth();
                                                if (months < 0) {
                                                    years--;
                                                    months += 12;
                                                }
                                                if (years < 0) return "Not born yet";
                                                if (years === 0) return `${months} months`;
                                                return `${years} yrs, ${months} mos`;
                                            })() : 'Unknown'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="md:col-span-2">
                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="health">Health & Weight</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="mt-6 space-y-6">
                                {/* Personality Section */}
                                <div className="bg-card rounded-xl p-6 border border-border/50 shadow-sm relative group">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-lg flex items-center gap-2">
                                            <Heart className="w-5 h-5 text-pink-500" />
                                            Personality
                                        </h3>
                                        {!isEditingPersonality && (
                                            <Button
                                                onClick={() => {
                                                    setTempPersonality(pig.personality_notes || "");
                                                    setIsEditingPersonality(true);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 px-3 text-xs"
                                            >
                                                Edit
                                            </Button>
                                        )}
                                    </div>

                                    {isEditingPersonality ? (
                                        <div className="space-y-4">
                                            <textarea
                                                value={tempPersonality}
                                                onChange={(e) => setTempPersonality(e.target.value)}
                                                className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background resize-none"
                                                placeholder="What's their personality like?"
                                            />
                                            <div className="flex justify-end gap-2">
                                                <Button onClick={() => setIsEditingPersonality(false)} className="h-8 px-3 text-xs bg-transparent text-foreground hover:bg-muted">Cancel</Button>
                                                <Button onClick={() => handleUpdateProfile('personality_notes', tempPersonality)} className="h-8 px-3 text-xs">Save</Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground whitespace-pre-wrap">
                                            {pig.personality_notes || "No personality notes yet. Add some!"}
                                        </p>
                                    )}
                                </div>

                                {/* Food Preferences Section */}
                                <div className="bg-card rounded-xl p-6 border border-border/50 shadow-sm relative group">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-lg flex items-center gap-2">
                                            <Utensils className="w-5 h-5 text-green-500" />
                                            Food Preferences
                                        </h3>
                                        {!isEditingFood && (
                                            <Button
                                                onClick={() => {
                                                    setTempFood(pig.food_preferences || "");
                                                    setIsEditingFood(true);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 px-3 text-xs"
                                            >
                                                Edit
                                            </Button>
                                        )}
                                    </div>

                                    {isEditingFood ? (
                                        <div className="space-y-4">
                                            <textarea
                                                value={tempFood}
                                                onChange={(e) => setTempFood(e.target.value)}
                                                className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background resize-none"
                                                placeholder="What do they love to eat?"
                                            />
                                            <div className="flex justify-end gap-2">
                                                <Button onClick={() => setIsEditingFood(false)} className="h-8 px-3 text-xs bg-transparent text-foreground hover:bg-muted">Cancel</Button>
                                                <Button onClick={() => handleUpdateProfile('food_preferences', tempFood)} className="h-8 px-3 text-xs">Save</Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground whitespace-pre-wrap">
                                            {pig.food_preferences || "No food preferences logged."}
                                        </p>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="health" className="mt-6 space-y-6">
                                {/* Weight Chart */}
                                <div className="bg-card rounded-xl p-6 border border-border/50 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="font-bold text-lg flex items-center gap-2">
                                            <Scale className="w-5 h-5 text-blue-500" />
                                            Weight History
                                        </h3>
                                    </div>

                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={chartData}>
                                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                                <XAxis dataKey="date" fontSize={12} stroke="#888888" />
                                                <YAxis fontSize={12} stroke="#888888" domain={['dataMin - 50', 'dataMax + 50']} />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="weight"
                                                    stroke="hsl(var(--primary))"
                                                    strokeWidth={2}
                                                    dot={{ r: 4, fill: "hsl(var(--primary))" }}
                                                    activeDot={{ r: 6 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Add Weight Form */}
                                <div className="bg-card rounded-xl p-6 border border-border/50 shadow-sm">
                                    <h4 className="font-bold mb-4">Log New Weight</h4>
                                    <form onSubmit={handleAddWeight} className="flex gap-4">
                                        <div className="flex-1">
                                            <input
                                                type="number"
                                                placeholder="Weight (grams)"
                                                value={newWeight}
                                                onChange={e => setNewWeight(e.target.value)}
                                                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                                required
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                placeholder="Notes (optional)"
                                                value={weightNote}
                                                onChange={e => setWeightNote(e.target.value)}
                                                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                            />
                                        </div>
                                        <Button type="submit">Log</Button>
                                    </form>
                                </div>

                                {/* Recent Logs */}
                                <div className="space-y-4">
                                    <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Recent Logs</h4>
                                    {weights.map(log => (
                                        <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center font-bold text-xs uppercase text-muted-foreground border">
                                                    {new Date(log.date).getDate()}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{log.weight_grams}g</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {new Date(log.date).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {log.notes && (
                                                    <span className="text-sm text-muted-foreground">{log.notes}</span>
                                                )}
                                                <Button
                                                    onClick={() => handleDeleteWeight(log.id)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 bg-transparent text-destructive hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileDetail;
