import { createContext, useContext } from 'react';
import type { ComponentType } from 'react';
import { TextInput, type TextInputProps } from 'react-native';

// Inside a bottom sheet, text fields must be the sheet-aware TextInput so the sheet moves
// with the keyboard. Input and TextArea read this context; screens never set it.
export const SheetInputContext = createContext<ComponentType<TextInputProps>>(TextInput);
export const useSheetInput = () => useContext(SheetInputContext);
