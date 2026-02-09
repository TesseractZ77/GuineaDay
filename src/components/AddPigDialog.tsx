import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

interface AddPigDialogProps {
    onPigAdded: () => void;
}

export function AddPigDialog({ onPigAdded }: AddPigDialogProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [breed, setBreed] = useState("");
    const [gender, setGender] = useState("");
    const [color, setColor] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        try {
            const res = await fetch("http://localhost:8000/guineapigs/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, breed, gender, color, birth_date: birthDate || null }),
            });

            if (res.ok) {
                setOpen(false);
                setName("");
                setBreed("");
                setGender("");
                setColor("");
                setBirthDate("");
                onPigAdded();
            } else {
                const errorData = await res.json();
                console.error("Server error:", errorData);
                alert(`Failed to add pig: ${JSON.stringify(errorData)}`);
            }
        } catch (error) {
            console.error("Failed to add pig:", error);
            alert("Failed to connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="w-4 h-4 mr-2" /> Add Piggy
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Guinea Pig</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="breed" className="text-right">
                            Breed
                        </Label>
                        <Input
                            id="breed"
                            value={breed}
                            onChange={(e) => setBreed(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="gender" className="text-right">
                            Gender
                        </Label>
                        <Input
                            id="gender"
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className="col-span-3"
                            placeholder="Boar / Sow"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="birthDate" className="text-right">
                            Birth Day
                        </Label>
                        <Input
                            id="birthDate"
                            type="date" // <--- Important: Date picker type
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                            className="col-span-3"
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="color" className="text-right">
                            Color
                        </Label>
                        <Input
                            id="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="col-span-3"
                            placeholder="e.g. bg-orange-100"
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={loading}>
                            {loading ? "Adding..." : "Add Piggy"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
