import type { Metadata } from "next";
import SettingsView from "@/components/settings/SettingsView";
import { getWeeklyDigest } from "@/lib/data";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  return <SettingsView digest={await getWeeklyDigest()} />;
}
