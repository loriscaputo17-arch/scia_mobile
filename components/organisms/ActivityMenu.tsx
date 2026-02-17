import { View, TouchableOpacity, Modal, Alert } from "react-native";
import React from "react";
import { FontAwesome5, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import Menu, { type MenuAction } from "../molecules/Menu";
import { useRouter } from "expo-router";
import { type Maintenance } from "@/data/maintenences";
import { type Task } from "@/data/tasks";
import { type Reading } from "@/data/readings";
import { type Malfunction } from "@/data/malfunctions";
import { type Replacement } from "@/data/replacements";
import { type Job } from "@/data/jobs";
import { type Failure } from "@/data/failures";

type ActivityMenuProps = {
  isActive: boolean; // Proprietà per determinare se il menu è attivo
  activity:  Task | Reading | Failure | Replacement | Job;
  activityType?: "maintenance" | "task" | "reading" | "failure" | "replacement";
  onPlayPause? : (maintenance : Job) => void,
  onOpen: () => void; // Funzione per aprire il menu
  onClose: () => void; // Funzione per chiudere il menu
};

export default function ActivityMenu({ isActive, activity, activityType, onPlayPause, onOpen, onClose }: ActivityMenuProps) {
  const router = useRouter();

  const actions: MenuAction[] = (() => {
    switch (activityType) {
      case "maintenance":
        return [
          {
            label: "Dettagli",
            IconComponent: MaterialCommunityIcons,
            iconProps: { name: "eye" },
            onClick: () => {
              onClose();
              router.push(`/dashboard/manutenzioni/${(activity as Job).id}`);
            },
          },
          {
            label: "Push&Buy",
            IconComponent: MaterialIcons,
            iconProps: { name: "bolt" },
            onClick: () => {
              onClose();
              alert("push and buy");
            },
          },
          {
            label: (activity as Job).status.name === "inPause" ? "Play" : "Pause",
            IconComponent: MaterialIcons,
            iconProps: { name: (activity as Job).status.name === "inPause" ? "play-arrow" : "pause" },
            onClick: () => {
              onClose();
              onPlayPause && onPlayPause(activity as Job);
            },
          },
        ];

      case "reading":
        return [
          {
            label: "Dettagli",
            IconComponent: MaterialCommunityIcons,
            iconProps: { name: "eye" },
            onClick: () => {
              onClose();
              router.push(`/dashboard/letture/${(activity as Reading).id}`);
            },
          },
        ];
      case "failure":
        return [
          {
            label: "Dettagli",
            IconComponent: MaterialCommunityIcons,
            iconProps: { name: "eye" },
            onClick: () => {
              onClose();
              router.push(`/dashboard/avarie/${(activity as Failure).id}`);
            },
          },
        ];
      case "task":
        return [
          {
            label: "Dettagli",
            IconComponent: MaterialCommunityIcons,
            iconProps: { name: "eye" },
            onClick: () => {
              onClose();
              router.push(`/dashboard/checklist/${(activity as Job).id}`);
            },
          },
        ];
      case "replacement":
        return [
          {
            label: "Dettagli",
            IconComponent: MaterialCommunityIcons,
            iconProps: { name: "eye" },
            onClick: () => {
              onClose();
              router.push(`/dashboard/catalogo_ricambi/${(activity as Replacement).ID}`);
            },
          },
        ];

      default:
        return [];
    }
  })();

  return (
    <>
      <TouchableOpacity onPress={isActive ? onClose : onOpen}>
        <MaterialIcons name="more-vert" color="#fff" size={24} />
      </TouchableOpacity>

      <Menu
        actions={actions}
        visible={isActive}
        onClose={onClose}
        styleWind="absolute w-40 top-[50%] right-3 border-[1px] border-primary bg-white rounded-md shadow-lg pt-space xxl:pt-space-xxl px-space xxl:px-space-xxl"
      />
    </>
  );
}
