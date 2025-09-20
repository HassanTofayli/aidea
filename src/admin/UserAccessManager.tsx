import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Alert,
  Autocomplete,
  TextField,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { Item, Profile, UserAccess } from '../types/database.types';
import { supabase } from '../services/supabase';

interface UserAccessWithDetails extends UserAccess {
  user?: Profile;
  item?: Item;
}

export const UserAccessManager: React.FC = () => {
  const [accessList, setAccessList] = useState<UserAccessWithDetails[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Profile[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('email');

      if (usersError) throw usersError;
      setUsers(usersData || []);

      // Fetch all items
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('*')
        .order('title');

      if (itemsError) throw itemsError;
      setItems(itemsData || []);

      // Fetch user access with details
      const { data: accessData, error: accessError } = await supabase
        .from('user_access')
        .select(`
          *,
          user:profiles!user_access_user_id_fkey(id, email, full_name, role),
          item:items!user_access_item_id_fkey(id, title)
        `)
        .order('granted_at', { ascending: false });

      if (accessError) throw accessError;
      setAccessList(accessData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item: Item) => {
    setSelectedItem(item);
    // Get users who already have access to this item
    const existingAccess = accessList
      .filter((access) => access.item_id === item.id)
      .map((access) => access.user_id);

    const usersWithAccess = users.filter(user => existingAccess.includes(user.id));
    setSelectedUsers(usersWithAccess);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedItem(null);
    setSelectedUsers([]);
  };

  const handleSubmit = async () => {
    if (!selectedItem) return;

    setError(null);
    try {
      // Get current access for this item
      const currentAccess = accessList
        .filter((access) => access.item_id === selectedItem.id)
        .map((access) => access.user_id);

      const selectedUserIds = selectedUsers.map(user => user.id);

      // Find users to add
      const usersToAdd = selectedUserIds.filter(id => !currentAccess.includes(id));

      // Find users to remove
      const usersToRemove = currentAccess.filter(id => !selectedUserIds.includes(id));

      // Add new access
      if (usersToAdd.length > 0) {
        const newAccess = usersToAdd.map(user_id => ({
          user_id,
          item_id: selectedItem.id,
        }));

        const { error: addError } = await supabase
          .from('user_access')
          .insert(newAccess);

        if (addError) throw addError;
      }

      // Remove access
      if (usersToRemove.length > 0) {
        const { error: removeError } = await supabase
          .from('user_access')
          .delete()
          .eq('item_id', selectedItem.id)
          .in('user_id', usersToRemove);

        if (removeError) throw removeError;
      }

      await fetchData();
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving access:', err);
      setError('فشل في حفظ صلاحيات الوصول');
    }
  };

  const handleRevokeAccess = async (userId: string, itemId: string) => {
    if (!window.confirm('هل أنت متأكد من إلغاء هذا الوصول؟')) return;

    setError(null);
    try {
      const { error } = await supabase
        .from('user_access')
        .delete()
        .eq('user_id', userId)
        .eq('item_id', itemId);

      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Error revoking access:', err);
      setError('فشل في إلغاء الوصول');
    }
  };

  // Group access by item
  const accessByItem = items.reduce((acc, item) => {
    acc[item.id] = accessList.filter((access) => access.item_id === item.id);
    return acc;
  }, {} as Record<string, UserAccessWithDetails[]>);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5">إدارة صلاحيات الوصول</Typography>
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
              <TableCell>العنصر</TableCell>
              <TableCell>المستخدمون المصرح لهم</TableCell>
              <TableCell>الإجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.title}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {accessByItem[item.id]?.map((access) => (
                      <Chip
                        key={`${access.user_id}-${access.item_id}`}
                        label={access.user?.email || 'Unknown'}
                        onDelete={() =>
                          handleRevokeAccess(access.user_id, access.item_id)
                        }
                        color={access.user?.role === 'admin' ? 'secondary' : 'default'}
                        size="small"
                      />
                    ))}
                    {(!accessByItem[item.id] || accessByItem[item.id].length === 0) && (
                      <Typography variant="body2" color="text.secondary">
                        لا يوجد مستخدمون
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    startIcon={<PersonIcon />}
                    onClick={() => handleOpenDialog(item)}
                    size="small"
                  >
                    إدارة الوصول
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Access Management Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          إدارة الوصول لـ: {selectedItem?.title}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Autocomplete
              multiple
              options={users}
              getOptionLabel={(option) => `${option.email} (${option.role})`}
              value={selectedUsers}
              onChange={(_, newValue) => setSelectedUsers(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="المستخدمون المصرح لهم"
                  placeholder="اختر المستخدمين"
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option.email}
                    {...getTagProps({ index })}
                    color={option.role === 'admin' ? 'secondary' : 'default'}
                  />
                ))
              }
            />
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            ملاحظة: المسؤولون (admin) لديهم وصول تلقائي لجميع العناصر
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>إلغاء</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            حفظ التغييرات
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};