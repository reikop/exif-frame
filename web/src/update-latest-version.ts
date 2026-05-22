import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { CapacitorUpdater } from '@capgo/capacitor-updater';

async function updateLatestVersion(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await SplashScreen.hide();
  } catch (e) {
    await SplashScreen.hide();
  }

  CapacitorUpdater.notifyAppReady();
}

updateLatestVersion();
