import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Search, CalendarIcon, AlertCircle, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { 
  NotificationLog, 
  getNotificationLogs 
} from '@/services/notificationTemplates';
import { useToast } from '@/hooks/use-toast';

export const NotificationAlerts = () => {
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const { toast } = useToast();
  
  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const data = await getNotificationLogs();
      setLogs(data);
    } catch (error) {
      console.error('Error fetching notification logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notification logs',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchLogs();
  }, []);
  
  // Filter logs based on search term and filters
  const filteredLogs = logs.filter(log => {
    // Search term filter
    const searchMatch = 
      searchTerm === '' ||
      log.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.recipientPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.templateName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Date filter
    let dateMatch = true;
    if (dateFilter && log.sentAt) {
      const logDate = log.sentAt.toDate ? log.sentAt.toDate() : new Date(log.sentAt);
      dateMatch = 
        logDate.getDate() === dateFilter.getDate() &&
        logDate.getMonth() === dateFilter.getMonth() &&
        logDate.getFullYear() === dateFilter.getFullYear();
    }
    
    // Type filter
    const typeMatch = typeFilter === 'all' || log.type === typeFilter;
    
    // Status filter
    const statusMatch = statusFilter === 'all' || log.status === statusFilter;
    
    return searchMatch && dateMatch && typeMatch && statusMatch;
  });
  
  const getStatusBadge = (status: string) => {
    const statusColors = {
      sent: 'bg-green-100 text-green-800 border-green-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      pending: 'bg-amber-100 text-amber-800 border-amber-200',
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };
  
  const getTypeBadge = (type: string) => {
    const typeColors = {
      confirmation: 'bg-blue-100 text-blue-800 border-blue-200',
      reminder: 'bg-purple-100 text-purple-800 border-purple-200',
      cancellation: 'bg-rose-100 text-rose-800 border-rose-200',
      reschedule: 'bg-amber-100 text-amber-800 border-amber-200',
    };
    return typeColors[type as keyof typeof typeColors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };
  
  const getChannelBadge = (channel: string) => {
    const channelColors = {
      whatsapp: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      sms: 'bg-sky-100 text-sky-800 border-sky-200',
      both: 'bg-violet-100 text-violet-800 border-violet-200',
    };
    return channelColors[channel as keyof typeof channelColors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };
  
  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return format(dateObj, 'MMM dd, yyyy - HH:mm');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Notification Alerts</CardTitle>
            <CardDescription>
              Recent notifications sent to patients
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            onClick={fetchLogs}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Date filter */}
          <div className="sm:w-[180px]">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFilter ? format(dateFilter, 'PPP') : <span>Filter by date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateFilter}
                  onSelect={setDateFilter}
                  initialFocus
                />
                {dateFilter && (
                  <div className="p-2 border-t flex justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDateFilter(undefined)}
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Type filter */}
          <div className="sm:w-[150px]">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Message type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="confirmation">Confirmation</SelectItem>
                <SelectItem value="reminder">Reminder</SelectItem>
                <SelectItem value="cancellation">Cancellation</SelectItem>
                <SelectItem value="reschedule">Reschedule</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Status filter */}
          <div className="sm:w-[150px]">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map(log => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(log.sentAt)}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{log.recipientName}</div>
                        <div className="text-xs text-gray-500">{log.recipientPhone}</div>
                      </TableCell>
                      <TableCell>{log.templateName}</TableCell>
                      <TableCell>
                        <Badge className={getTypeBadge(log.type)}>
                          {log.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getChannelBadge(log.channel)}>
                          {log.channel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(log.status)}>
                          {log.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      {searchTerm || dateFilter || typeFilter !== 'all' || statusFilter !== 'all' ? (
                        <div className="flex flex-col items-center">
                          <AlertCircle className="h-8 w-8 text-gray-400 mb-2" />
                          <span>No notifications match your filter criteria</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <AlertCircle className="h-8 w-8 text-gray-400 mb-2" />
                          <span>No notification logs found</span>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationAlerts;
