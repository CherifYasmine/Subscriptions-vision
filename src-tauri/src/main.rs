#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_notification::init())
    // .plugin(tauri_plugin_log::Builder::default().build()) // optional; enable if you want logs
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}