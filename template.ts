// Powered by OnSpace.AI
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Platform } from 'react-native';

interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

interface AlertConfig {
  title: string;
  message?: string;
  buttons?: AlertButton[];
}

interface AlertContextValue {
  showAlert: (title: string, message?: string, buttons?: AlertButton[]) => void;
}

const AlertContext = createContext<AlertContextValue | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AlertConfig | null>(null);

  const showAlert = useCallback((title: string, message?: string, buttons?: AlertButton[]) => {
    setConfig({ title, message, buttons: buttons || [{ text: 'OK' }] });
  }, []);

  const dismiss = useCallback((btn?: AlertButton) => {
    setConfig(null);
    if (btn?.onPress) btn.onPress();
  }, []);

  return React.createElement(
    AlertContext.Provider,
    { value: { showAlert } },
    children,
    config ? React.createElement(
      Modal,
      { visible: true, transparent: true, animationType: 'fade', statusBarTranslucent: true },
      React.createElement(
        View,
        { style: alertStyles.overlay },
        React.createElement(
          View,
          { style: alertStyles.box },
          React.createElement(Text, { style: alertStyles.title }, config.title),
          config.message ? React.createElement(Text, { style: alertStyles.message }, config.message) : null,
          React.createElement(
            View,
            { style: alertStyles.btns },
            ...(config.buttons || []).map((btn, i) =>
              React.createElement(
                Pressable,
                { key: i, style: [alertStyles.btn, btn.style === 'cancel' && alertStyles.cancelBtn], onPress: () => dismiss(btn) },
                React.createElement(Text, {
                  style: [alertStyles.btnText, btn.style === 'destructive' && alertStyles.destructiveText, btn.style === 'cancel' && alertStyles.cancelText]
                }, btn.text)
              )
            )
          )
        )
      )
    ) : null
  );
}

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlert() must be used within AlertProvider');
  return ctx;
}

const alertStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 32 },
  box: { backgroundColor: '#1C2128', borderRadius: 16, padding: 24, width: '100%', maxWidth: 320, borderWidth: 1, borderColor: '#30363D' },
  title: { fontSize: 17, fontWeight: '600', color: '#E6EDF3', marginBottom: 8, textAlign: 'center' },
  message: { fontSize: 14, color: '#8B949E', marginBottom: 20, textAlign: 'center', lineHeight: 20 },
  btns: { flexDirection: 'row', gap: 8 },
  btn: { flex: 1, backgroundColor: '#00D4AA', borderRadius: 999, paddingVertical: 12, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#21262D', borderWidth: 1, borderColor: '#30363D' },
  btnText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  destructiveText: { color: '#fff' },
  cancelText: { color: '#E6EDF3' },
});
