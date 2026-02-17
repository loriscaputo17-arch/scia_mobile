import React, { useState } from "react";
import { View, Text, ScrollView, ViewStyle, RefreshControl } from "react-native";

interface CustomTableCell {
  content: React.ReactNode;
  styleWind?: string; // Tailwind classes for custom styles
  style?: ViewStyle; // Native styles
}

interface CustomTableProps {
  columns: CustomTableCell[];
  data: CustomTableCell[][];
  refresh?: () => Promise<void>;
  // subHeaderRow?: CustomTableCell[];
}

const CustomTable: React.FC<CustomTableProps> = ({ columns, /*  subHeaderRow, */ data, refresh }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!refresh) return;
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  };
  return (
    <ScrollView refreshControl={refresh ? <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={["#00BFFF"]} tintColor="#00BFFF" /> : undefined}>
      <View className="flex-1 rounded-md overflow-hidden">
        {/* Header Row */}
        <View className="flex-row w-full">
          {columns.map((column, index) => (
            <View
              key={index}
              className={`flex-1 bg-white ${index < columns.length - 1 && "mr-1"} mb-1 p-space ${column.styleWind}`}
              style={column.style} // Applica gli stili inline
            >
              {column.content}
            </View>
          ))}
        </View>

        {/* Sub-header */}
        {/* {subHeaderRow && (
          <View className="flex-row w-full mb-1">
            {subHeaderRow.map((cell, index) => (
              <View key={index} className={`flex-1 bg-white ${index < subHeaderRow.length - 1 && "mr-1"} p-space ${cell.styleWind}`} style={cell.style}>
                {cell.content}
              </View>
            ))}
          </View>
        )} */}

        {/* Data Rows */}
        {data.map((rowData, rowIndex) => (
          <View key={rowIndex} className="flex-row flex">
            {rowData.map((cellData, cellIndex) => (
              <View
                key={cellIndex}
                className={`flex-1 ${rowIndex < data.length - 1 && "mb-1"}  
                ${cellIndex < rowData.length - 1 && "mr-1"} justify-center p-space bg-secondary  
                ${cellData.styleWind}`}
                style={cellData.style}
              >
                {cellData.content}
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default CustomTable;
