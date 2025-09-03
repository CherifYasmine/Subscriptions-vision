import { isPermissionGranted, requestPermission, sendNotification } from "@tauri-apps/plugin-notification";

export async function ensureNotifPermission() {
  let granted = await isPermissionGranted();
  if (!granted) granted = (await requestPermission()) === "granted";
  return granted;
}

export async function notify(title: string, body: string) {
  if (await ensureNotifPermission()) {
    await sendNotification({ title, body });
  }
}
