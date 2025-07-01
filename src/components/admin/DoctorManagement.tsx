import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash2, Star, Eye, RefreshCw } from 'lucide-react';
import { Doctor, getDoctors, deleteDoctor } from '@/services/firebase';
import { DoctorForm } from './DoctorForm';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const DoctorManagement = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Fetch doctors on mount
  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const doctorsData = await getDoctors();
      setDoctors(doctorsData);
      setError(null);
    } catch (err) {
      console.error("Error fetching doctors:", err);
      setError("Failed to load doctors. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsDialogOpen(true);
  };

  const handleDeleteDoctor = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) {
      return;
    }

    try {
      await deleteDoctor(id);
      setDoctors((prev) => prev.filter((doctor) => doctor.id !== id));
      toast({
        title: "Doctor deleted",
        description: "Doctor has been successfully deleted.",
      });
    } catch (err) {
      console.error("Error deleting doctor:", err);
      toast({
        title: "Error",
        description: "Failed to delete doctor. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDoctorSaved = () => {
    fetchDoctors();
    setIsDialogOpen(false);
    setSelectedDoctor(null);
  };

  const filteredDoctors = doctors.filter(doctor => 
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <CardTitle>Doctor Management</CardTitle>
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Input 
              placeholder="Search doctors..." 
              className="w-full sm:w-64 pl-9 pr-4 py-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => setSelectedDoctor(null)} 
                className="bg-gradient-to-r from-blue-600 to-emerald-600 w-full sm:w-auto"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Doctor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedDoctor ? "Edit Doctor" : "Add New Doctor"}
                </DialogTitle>
              </DialogHeader>
              <DoctorForm 
                doctor={selectedDoctor} 
                onSaved={handleDoctorSaved} 
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={fetchDoctors} className="flex items-center">
                <RefreshCw className="mr-2 h-3 w-3" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredDoctors.length > 0 ? (
          <div className="rounded-md border overflow-hidden overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Image</TableHead>
                  <TableHead className="whitespace-nowrap">Name</TableHead>
                  <TableHead className="whitespace-nowrap">Specialty</TableHead>
                  <TableHead className="whitespace-nowrap hidden md:table-cell">Experience</TableHead>
                  <TableHead className="whitespace-nowrap hidden sm:table-cell">Rating</TableHead>
                  <TableHead className="whitespace-nowrap hidden lg:table-cell">Status</TableHead>
                  <TableHead className="whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDoctors.map((doctor) => (
                  <TableRow key={doctor.id}>
                    <TableCell>
                      {doctor.image ? (
                        <img 
                          src={doctor.image} 
                          alt={doctor.name} 
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          {doctor.name.charAt(0)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium max-w-[120px] sm:max-w-none truncate">
                      {doctor.name}
                    </TableCell>
                    <TableCell className="max-w-[100px] sm:max-w-none truncate">
                      {doctor.specialty}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {doctor.experience}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center">
                        {doctor.rating || "-"}
                        {doctor.rating && <Star className="h-3 w-3 ml-1 text-yellow-400 fill-yellow-400" />}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        doctor.availableToday 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {doctor.availableToday ? "Available" : "Unavailable"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1 sm:space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                          title="View Doctor"
                          asChild
                        >
                          <a href={`/doctors?id=${doctor.id}`} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                          </a>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleEditDoctor(doctor)}
                          className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                          title="Edit Doctor"
                        >
                          <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => doctor.id && handleDeleteDoctor(doctor.id)}
                          className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                          title="Delete Doctor"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? (
              <>
                <p>No doctors found matching "{searchTerm}".</p>
                <Button variant="outline" className="mt-2" onClick={() => setSearchTerm('')}>
                  Clear Search
                </Button>
              </>
            ) : (
              <p>No doctors found. Add a doctor to get started.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};


