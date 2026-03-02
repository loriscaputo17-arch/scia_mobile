import { useEffect, useState } from "react";
import {
  View, Text, TouchableOpacity, Modal, Pressable,
  TextInput, ScrollView, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { router } from "expo-router";
import api from "@/api/axios";

// ─── API ──────────────────────────────────────────────────────────────────────
const fetchElements = async (shipId: string, userId: string, teamId: string) => {
  const res = await api.post(`/element/getElements/${shipId}/${userId}`, { teamId });
  return res.data || [];
};

// ─── Tree Node ────────────────────────────────────────────────────────────────
function TreeNode({ node, level, openNodes, toggleNode, selectedId, onSelect, navigable }: {
  node: any; level: number; openNodes: Record<string, boolean>;
  toggleNode: (id: any) => void; selectedId: any;
  onSelect?: (node: any) => void; navigable?: boolean;
}) {
  const hasChildren = node.children?.length > 0;
  const isOpen = openNodes[node.id];
  const isSelected = selectedId === node.id;

  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: "#ffffff15" }}>
        {/* Expand arrow */}
        <TouchableOpacity onPress={() => toggleNode(node.id)} style={{ width: 24, alignItems: "center" }}>
          {hasChildren && (
            <Ionicons name={isOpen ? "chevron-down" : "chevron-forward"} size={14} color="#fff" />
          )}
        </TouchableOpacity>

        {/* Label */}
        <TouchableOpacity style={{ flex: 1, paddingLeft: level * 8 }} onPress={() => toggleNode(node.id)}>
          <Text style={{ color: "#fff", fontSize: 14 }}>{node.eswbs_code} - {node.name}</Text>
        </TouchableOpacity>

        {/* Checkbox (select mode) */}
        {onSelect && (
          <TouchableOpacity onPress={() => onSelect(isSelected ? null : node)} style={{ marginRight: 8 }}>
            <View style={{ width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: isSelected ? "#789fd6" : "#ffffff40", backgroundColor: isSelected ? "#789fd6" : "transparent" }} />
          </TouchableOpacity>
        )}

        {/* Navigate arrow */}
        {navigable && (
          <TouchableOpacity onPress={() => router.push(`/(app)/impianti/${node.code}` as any)}>
            <Ionicons name="chevron-forward" size={16} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {hasChildren && isOpen && (
        <View style={{ marginLeft: 8 }}>
          {node.children.map((child: any) => (
            <TreeNode key={child.id} node={child} level={level + 1} openNodes={openNodes}
              toggleNode={toggleNode} selectedId={selectedId} onSelect={onSelect} navigable={navigable} />
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Facilities Modal ─────────────────────────────────────────────────────────
export default function FacilitiesModal({ visible, onClose, eswbsCode, onSelectSystem }: {
  visible: boolean; onClose: () => void; eswbsCode?: string;
  onSelectSystem?: (node: any) => void;
}) {
  const user = useSelector((state: RootState) => state.auth?.user) as any;
  const [elements, setElements] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [openNodes, setOpenNodes] = useState<Record<string, boolean>>({});
  const [selectedId, setSelectedId] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const shipId = String(user?.teamInfo?.assignedShip?.id || "");
  const teamId = String(user?.teamInfo?.teamId || "");

  useEffect(() => {
    if (!visible || !user?.id) return;
    setLoading(true);
    fetchElements(shipId, String(user.id), teamId)
      .then((data) => {
        setElements(data);
        setFiltered(data);
        // Auto-expand to eswbsCode if provided
        if (eswbsCode) {
          const chain = findParentChain(data, eswbsCode);
          if (chain) {
            const expanded: Record<string, boolean> = {};
            chain.forEach((id) => (expanded[id] = true));
            setOpenNodes(expanded);
          }
        }
      })
      .finally(() => setLoading(false));
  }, [visible, user]);

  const findParentChain = (nodes: any[], code: string, path: any[] = []): any[] | null => {
    for (const node of nodes) {
      const currentPath = [...path, node.id];
      if (node.code === code) return currentPath;
      if (node.children) {
        const res = findParentChain(node.children, code, currentPath);
        if (res) return res;
      }
    }
    return null;
  };

  const filterTree = (nodes: any[], text: string): any[] => {
    if (!text.trim()) return nodes;
    return nodes.reduce((acc: any[], node) => {
      const children = filterTree(node.children || [], text);
      const match = node.name?.toLowerCase().includes(text.toLowerCase());
      if (match || children.length > 0) acc.push({ ...node, children });
      return acc;
    }, []);
  };

  useEffect(() => {
    setFiltered(filterTree(elements, search));
    if (search.trim()) {
      // Auto-expand all when searching
      const expandAll = (nodes: any[], expanded: Record<string, boolean>) => {
        nodes.forEach((n) => { expanded[n.id] = true; expandAll(n.children || [], expanded); });
        return expanded;
      };
      setOpenNodes(expandAll(elements, {}));
    }
  }, [search, elements]);

  const toggleNode = (id: any) =>
    setOpenNodes((p) => ({ ...p, [id]: !p[id] }));

  const handleSelect = (node: any) => {
    setSelectedId(node ? node.id : null);
    if (node && onSelectSystem) onSelectSystem(node);
  };

  const handleConfirm = () => {
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }} onPress={onClose}>
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#022a52", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: "85%" }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>Filtro impianti</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#fff" /></TouchableOpacity>
          </View>

          <View style={{ backgroundColor: "#ffffff10", borderRadius: 8, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, marginBottom: 14 }}>
            <Ionicons name="search-outline" size={18} color="#ffffff80" />
            <TextInput value={search} onChangeText={setSearch} placeholder="Cerca impianto..." placeholderTextColor="#6b7280"
              style={{ flex: 1, color: "#fff", padding: 10 }} />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={18} color="#ffffff80" />
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <View style={{ paddingVertical: 40, alignItems: "center" }}>
              <ActivityIndicator color="#789fd6" size="large" />
            </View>
          ) : (
            <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
              {filtered.map((node) => (
                <TreeNode key={node.id} node={node} level={0} openNodes={openNodes}
                  toggleNode={toggleNode} selectedId={selectedId}
                  onSelect={onSelectSystem ? handleSelect : undefined}
                  navigable={!onSelectSystem} />
              ))}
              {filtered.length === 0 && (
                <Text style={{ color: "#ffffff60", textAlign: "center", paddingVertical: 24 }}>Nessun impianto trovato</Text>
              )}
            </ScrollView>
          )}

          <TouchableOpacity onPress={handleConfirm}
            style={{ backgroundColor: "#789fd6", borderRadius: 8, padding: 14, alignItems: "center", marginTop: 16 }}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>Conferma</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}