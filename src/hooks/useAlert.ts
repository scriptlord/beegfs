import { useContext } from 'react';
import { AlertContext } from '../components/AlertProvider';

export function useAlert() {
  return useContext(AlertContext);
}
