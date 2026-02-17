import React, { useState } from "react";
import { View, TextInput, ScrollView } from "react-native";
import TreeView from "@/components/organisms/TreeView";
import { TreeNodeType } from "@/components/molecules/TreeNode";
import { FontAwesome } from "@expo/vector-icons";

export type SearchableTreeViewProps = {
  treeData: TreeNodeType[];
};

export default function SearchableTreeView({
  treeData,
}: SearchableTreeViewProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filterTreeData = (
    nodes: TreeNodeType[],
    query: string
  ): TreeNodeType[] => {
    if (!query) return nodes;

    return nodes.reduce((filtered: TreeNodeType[], node) => {
      const children = filterTreeData(node.children, query);
      if (
        node.fullName.toLowerCase().includes(query.toLowerCase()) ||
        children.length > 0
      ) {
        filtered.push({ ...node, children });
      }
      return filtered;
    }, []);
  };

  const filteredData = filterTreeData(treeData, searchQuery);

  return (
    <ScrollView>
      <View className="p-space xxl:px-space-xxl bg-secondary rounded-md">
        <View className="flex-row items-center bg-gray-300 rounded-md h-10 px-3 mb-2.5">
          <TextInput
            className="flex-1 h-full text-black"
            placeholder="Cerca per nome impianto..."
            placeholderTextColor="#000"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <FontAwesome name="search" size={16} color="white" />
        </View>

        <TreeView treeData={filteredData} />
      </View>
    </ScrollView>
  );
}
