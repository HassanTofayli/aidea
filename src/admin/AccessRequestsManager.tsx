import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Alert,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Notes as NotesIcon,
} from '@mui/icons-material';
import { AccessRequest, Profile, Item } from '../types/database.types';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

interface AccessRequestWithDetails extends AccessRequest {
  user?: Profile;
  item?: Item;
}

export const AccessRequestsManager: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [requests, setRequests] = useState<AccessRequestWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notesDialog, setNotesDialog] = useState<{
    open: boolean;
    request: AccessRequestWithDetails | null;
    notes: string;
  }>({
    open: false,
    request: null,
    notes: '',
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('access_requests')
        .select(`
          *,
          user:profiles!access_requests_user_id_fkey(id, email, full_name),
          item:items!access_requests_item_id_fkey(id, title)
        `)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('فشل في تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request: AccessRequestWithDetails) => {
    setError(null);
    try {
      // Grant access
      const { error: accessError } = await supabase.from('user_access').insert({
        user_id: request.user_id,
        item_id: request.item_id,
      });

      if (accessError && accessError.code !== '23505') {
        // Ignore duplicate key error
        throw accessError;
      }

      // Update request status
      const { error: updateError } = await supabase
        .from('access_requests')
        .update({
          status: 'approved',
          resolved_at: new Date().toISOString(),
          resolved_by: currentUser?.id,
          admin_notes: notesDialog.notes,
        })
        .eq('id', request.id);

      if (updateError) throw updateError;

      await fetchRequests();
      setNotesDialog({ open: false, request: null, notes: '' });
    } catch (err) {
      console.error('Error approving request:', err);
      setError('فشل في الموافقة على الطلب');
    }
  };

  const handleDeny = async (request: AccessRequestWithDetails) => {
    setError(null);
    try {
      const { error } = await supabase
        .from('access_requests')
        .update({
          status: 'denied',
          resolved_at: new Date().toISOString(),
          resolved_by: currentUser?.id,
          admin_notes: notesDialog.notes,
        })
        .eq('id', request.id);

      if (error) throw error;

      await fetchRequests();
      setNotesDialog({ open: false, request: null, notes: '' });
    } catch (err) {
      console.error('Error denying request:', err);
      setError('فشل في رفض الطلب');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'denied':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'قيد الانتظار';
      case 'approved':
        return 'موافق عليه';
      case 'denied':
        return 'مرفوض';
      default:
        return status;
    }
  };

  const openNotesDialog = (request: AccessRequestWithDetails, action: 'approve' | 'deny') => {
    setNotesDialog({
      open: true,
      request,
      notes: '',
    });
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5">طلبات الوصول</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>المستخدم</TableCell>
              <TableCell>العنصر المطلوب</TableCell>
              <TableCell>تاريخ الطلب</TableCell>
              <TableCell>الحالة</TableCell>
              <TableCell>رسالة الطلب</TableCell>
              <TableCell>ملاحظات الإدارة</TableCell>
              <TableCell>الإجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.user?.email || 'Unknown'}</TableCell>
                <TableCell>{request.item?.title || 'Unknown'}</TableCell>
                <TableCell>
                  {new Date(request.requested_at).toLocaleDateString('ar-SA')}
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(request.status)}
                    color={getStatusColor(request.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{request.request_message || '-'}</TableCell>
                <TableCell>{request.admin_notes || '-'}</TableCell>
                <TableCell>
                  {request.status === 'pending' && (
                    <>
                      <IconButton
                        color="success"
                        onClick={() => openNotesDialog(request, 'approve')}
                        title="موافقة"
                      >
                        <CheckIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => openNotesDialog(request, 'deny')}
                        title="رفض"
                      >
                        <CloseIcon />
                      </IconButton>
                    </>
                  )}
                  {request.resolved_at && (
                    <Typography variant="caption" color="text.secondary">
                      {new Date(request.resolved_at).toLocaleDateString('ar-SA')}
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {requests.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            لا توجد طلبات وصول
          </Typography>
        </Box>
      )}

      {/* Notes Dialog */}
      <Dialog
        open={notesDialog.open}
        onClose={() => setNotesDialog({ open: false, request: null, notes: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {notesDialog.request && (
            <>
              معالجة طلب الوصول
              <Typography variant="body2" color="text.secondary">
                المستخدم: {notesDialog.request.user?.email} | العنصر: {notesDialog.request.item?.title}
              </Typography>
            </>
          )}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="ملاحظات (اختياري)"
            value={notesDialog.notes}
            onChange={(e) =>
              setNotesDialog((prev) => ({ ...prev, notes: e.target.value }))
            }
            margin="normal"
            placeholder="أضف ملاحظات للمستخدم أو للسجل..."
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setNotesDialog({ open: false, request: null, notes: '' })}
          >
            إلغاء
          </Button>
          <Button
            onClick={() => notesDialog.request && handleDeny(notesDialog.request)}
            color="error"
          >
            رفض
          </Button>
          <Button
            onClick={() => notesDialog.request && handleApprove(notesDialog.request)}
            color="success"
            variant="contained"
          >
            موافقة ومنح الوصول
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};