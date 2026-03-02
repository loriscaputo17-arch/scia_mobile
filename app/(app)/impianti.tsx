import { useEffect, useState } from "react";
import {
  View, Text, TouchableOpacity, TextInput,
  ActivityIndicator, ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import api from "@/api/axios";
import DashboardHeader from "@/components/organisms/DashboardHeader";
import { router } from "expo-router";

// ─── API ──────────────────────────────────────────────────────────────────────
const fetchElements = async (shipId: string, userId: string, teamId: string) => {
  const res = await api.post(`/element/getElements/${shipId}/${userId}`, { teamId });
  return res.data || [];
};

// ─── Tree helpers ─────────────────────────────────────────────────────────────
const filterTree = (nodes: any[], text: string): any[] => {
  if (!text.trim()) return nodes;
  return nodes.reduce((acc: any[], node) => {
    const children = filterTree(node.children || [], text);
    if (node.name?.toLowerCase().includes(text.toLowerCase()) || children.length > 0)
      acc.push({ ...node, children });
    return acc;
  }, []);
};

const expandAll = (nodes: any[], expanded: Record<string, boolean> = {}): Record<string, boolean> => {
  nodes.forEach((n) => { expanded[n.id] = true; expandAll(n.children || [], expanded); });
  return expanded;
};

// ─── Tree Node ────────────────────────────────────────────────────────────────
function TreeNode({ node, level, openNodes, toggleNode }: {
  node: any; level: number;
  openNodes: Record<string, boolean>;
  toggleNode: (id: any) => void;
}) {
  const hasChildren = node.children?.length > 0;
  const isOpen = openNodes[node.id];

  return (
    <View>
      <View style={{
        flexDirection: "row", alignItems: "center",
        paddingVertical: 14, paddingHorizontal: 12,
        paddingLeft: 12 + level * 16,
        borderBottomWidth: 1, borderBottomColor: "#ffffff15",
      }}>
        {/* Expand / collapse */}
        <TouchableOpacity onPress={() => toggleNode(node.id)} style={{ width: 20, alignItems: "center", marginRight: 8 }}>
          {hasChildren
            ? <Ionicons name={isOpen ? "chevron-down" : "chevron-forward"} size={14} color="#ffffff80" />
            : <View style={{ width: 14 }} />
          }
        </TouchableOpacity>

        {/* Label */}
        <TouchableOpacity style={{ flex: 1 }} onPress={() => toggleNode(node.id)}>
          <Text style={{ color: "#fff", fontSize: 14 }}>
            {node.eswbs_code && <Text style={{ color: "#789fd6" }}>{node.eswbs_code} </Text>}
            {node.name}
          </Text>
        </TouchableOpacity>

        {/* Navigate arrow */}
        <TouchableOpacity onPress={() => router.push(`/(app)/impianti/${node.code}` as any)}
          style={{ padding: 4 }}>
          <Ionicons name="chevron-forward" size={16} color="#ffffff60" />
        </TouchableOpacity>
      </View>

      {hasChildren && isOpen && (
        node.children.map((child: any) => (
          <TreeNode key={child.id} node={child} level={level + 1}
            openNodes={openNodes} toggleNode={toggleNode} />
        ))
      )}
    </View>
  );
}

// ─── Impianti Page ────────────────────────────────────────────────────────────
export default function ImpiantiPage() {
  const user = useSelector((state: RootState) => state.auth?.user) as any;
  const [elements, setElements] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [openNodes, setOpenNodes] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const shipId = String(user?.teamInfo?.assignedShip?.id || "");
  const teamId = String(user?.teamInfo?.teamId || "");

  useEffect(() => {
    if (!user?.id) return;
    fetchElements(shipId, String(user.id), teamId)
      .then((data) => { setElements(data); setFiltered(data); })
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    const result = filterTree(elements, search);
    setFiltered(result);
    if (search.trim()) setOpenNodes(expandAll(elements));
  }, [search, elements]);

  const toggleNode = (id: any) =>
    setOpenNodes((p) => ({ ...p, [id]: !p[id] }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38" }}>
      <View style={{ flex: 1, padding: 16 }}>
        <DashboardHeader />

        <Text style={{ color: "#fff", fontSize: 22, fontWeight: "700", marginTop: 16, marginBottom: 14 }}>
          Impianti
        </Text>

        {/* Search */}
        <View style={{ backgroundColor: "#022a52", borderRadius: 8, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, marginBottom: 12 }}>
          <Ionicons name="search-outline" size={18} color="#ffffff80" />
          <TextInput
            value={search} onChangeText={setSearch}
            placeholder="Cerca impianto..." placeholderTextColor="#6b7280"
            style={{ flex: 1, color: "#fff", padding: 10 }}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color="#ffffff80" />
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator color="#789fd6" size="large" />
          </View>
        ) : (
          <View style={{ flex: 1, backgroundColor: "#022a52", borderRadius: 12, overflow: "hidden" }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {filtered.length === 0 ? (
                <View style={{ padding: 32, alignItems: "center" }}>
                  <Ionicons name="construct-outline" size={48} color="#789fd6" />
                  <Text style={{ color: "#789fd6", marginTop: 12 }}>Nessun impianto trovato</Text>
                </View>
              ) : (
                filtered.map((node) => (
                  <TreeNode key={node.id} node={node} level={0}
                    openNodes={openNodes} toggleNode={toggleNode} />
                ))
              )}
            </ScrollView>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}