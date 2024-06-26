import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { Dispatch, ReactNode, SetStateAction } from 'react';

const boxStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4
};
interface MuiModalProps {
  isModalOpened: boolean;
  setIsModalOpened: Dispatch<SetStateAction<boolean>>;
  children: ReactNode;
}
export default function MuiModal({
  isModalOpened,
  setIsModalOpened,
  children
}: MuiModalProps) {
  const handleClose = () => setIsModalOpened(false);

  return (
    <div>
      <Modal
        open={isModalOpened}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={boxStyle}>{children}</Box>
      </Modal>
    </div>
  );
}
