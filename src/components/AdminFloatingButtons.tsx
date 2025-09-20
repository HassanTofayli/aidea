import React, { useState } from 'react';
import {
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Backdrop,
  Box,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Category as CategoryIcon,
  Link as ItemIcon,
  Settings as SettingsIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { CategoryDialog } from './dialogs/CategoryDialog';
import { ItemDialog } from './dialogs/ItemDialog';

interface AdminFloatingButtonsProps {
  onRefresh?: () => void;
}

export const AdminFloatingButtons: React.FC<AdminFloatingButtonsProps> = ({ onRefresh }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);

  const actions = [
    {
      icon: <CategoryIcon />,
      name: 'إضافة تصنيف',
      action: () => setCategoryDialogOpen(true),
      color: '#FF6B6B',
    },
    {
      icon: <ItemIcon />,
      name: 'إضافة عنصر',
      action: () => setItemDialogOpen(true),
      color: '#4ECDC4',
    },
    {
      icon: <SettingsIcon />,
      name: 'إعدادات',
      action: () => console.log('Settings'),
      color: '#45B7D1',
    },
  ];

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          left: 24,
          zIndex: 1300,
        }}
      >
        <SpeedDial
          ariaLabel="إجراءات المدير"
          sx={{
            '& .MuiFab-primary': {
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
              backdropFilter: 'blur(10px)',
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                transform: 'scale(1.05)',
                boxShadow: `0 12px 48px ${alpha(theme.palette.primary.main, 0.4)}`,
              },
              transition: 'all 0.3s ease',
            },
          }}
          icon={<SpeedDialIcon openIcon={<AdminIcon />} />}
          onClose={() => setOpen(false)}
          onOpen={() => setOpen(true)}
          open={open}
          direction="up"
        >
          {actions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              tooltipPlacement="right"
              onClick={() => {
                setOpen(false);
                action.action();
              }}
              sx={{
                backgroundColor: action.color,
                color: 'white',
                boxShadow: `0 4px 20px ${alpha(action.color, 0.3)}`,
                '&:hover': {
                  backgroundColor: action.color,
                  transform: 'scale(1.1)',
                  boxShadow: `0 8px 30px ${alpha(action.color, 0.4)}`,
                },
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </SpeedDial>
      </Box>

      <Backdrop
        open={open}
        sx={{
          zIndex: 1200,
          backgroundColor: alpha(theme.palette.background.default, 0.1),
          backdropFilter: 'blur(5px)',
        }}
        onClick={() => setOpen(false)}
      />

      <CategoryDialog
        open={categoryDialogOpen}
        onClose={() => setCategoryDialogOpen(false)}
        onSuccess={() => {
          setCategoryDialogOpen(false);
          onRefresh?.();
        }}
      />

      <ItemDialog
        open={itemDialogOpen}
        onClose={() => setItemDialogOpen(false)}
        onSuccess={() => {
          setItemDialogOpen(false);
          onRefresh?.();
        }}
      />
    </>
  );
};