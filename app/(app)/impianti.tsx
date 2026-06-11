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
import { useTranslation } from "@/app/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useDevice } from "@/hooks/useDevice";

// ─── API ──────────────────────────────────────────────────────────────────────
const fetchElements = async (shipId: string, userId: string, teamId: string) => {
  const res = await api.post(`/element/getElements/${shipId}/${userId}`, { teamId });
  return res.data || [];
};

const ELEMENTS_CACHE = (shipId: string, teamId: string) => `cache_elements_${shipId}_${teamId}`;

// ─── Macrogruppi sintetici (1000/2000/...) ──────────────────────────────────────
// Il backend NON restituisce i nodi-radice di macrogruppo: li creiamo lato app
// raggruppando i nodi top-level per prima cifra dell'ESWBS.
const MACRO_LABELS: Record<string, string> = {
  "1": "SCAFO",
  "2": "APP. MOTRICE / PROPULSIONE",
  "3": "IMPIANTO ELETTRICO",
  "4": "COMANDO E SORVEGLIANZA",
  "5": "IMPIANTI AUSILIARI",
  "6": "ALLESTIMENTO E SISTEMAZIONI",
  "7": "ARMAMENTO",
  "8": "VARIE / INTEGRAZIONE",
  "9": "ALTRO",
};

const groupByMacro = (nodes: any[]): any[] => {
  const groups: Record<string, any> = {};
  const order: string[] = [];
  for (const node of nodes) {
    const digit = String(node.eswbs_code || "").trim().charAt(0);
    const key = /^[1-9]$/.test(digit) ? digit : "9";
    if (!groups[key]) {
      groups[key] = {
        id: `macro-${key}`,
        eswbs_code: `${key}000`,
        name: MACRO_LABELS[key] || "ALTRO",
        isMacro: true,
        children: [],
      };
      order.push(key);
    }
    groups[key].children.push(node);
  }
  return order.sort((a, b) => a.localeCompare(b)).map((k) => groups[k]);
};

// ─── Tree helpers ─────────────────────────────────────────────────────────────
const sortTree = (nodes: any[]): any[] =>
  [...nodes]
    .sort((a, b) => String(a.eswbs_code || "").localeCompare(String(b.eswbs_code || "")))
    .map((n) => ({ ...n, children: sortTree(n.children || []) }));

const isStructuralNode = (code: string) => {
  if (!code) return false;
  return /0+$/.test(code);
};

const rootIconFor = (code?: string): any => {
  const d = code?.trim().charAt(0);
  const map: Record<string, string> = {
    "1": "boat-outline",
    "2": "cog-outline",
    "3": "flash-outline",
    "4": "navigate-outline",
    "5": "snow-outline",
    "6": "construct-outline",
    "7": "shield-outline",
    "8": "cube-outline",
    "9": "ellipsis-horizontal",
  };
  return d && map[d] ? map[d] : "cube-outline";
};

const filterTree = (nodes: any[], text: string): any[] => {
  if (!text.trim()) return nodes;
  const low = text.toLowerCase();
  return nodes.reduce((acc: any[], node) => {
    const children = filterTree(node.children || [], text);
    const match =
      node.name?.toLowerCase().includes(low) ||
      String(node.eswbs_code || "").toLowerCase().includes(low);
    if (match || children.length > 0) acc.push({ ...node, children });
    return acc;
  }, []);
};

const expandAll = (nodes: any[], expanded: Record<string, boolean> = {}): Record<string, boolean> => {
  nodes.forEach((n) => { expanded[n.id] = true; expandAll(n.children || [], expanded); });
  return expanded;
};

// ─── Indentazione ─────────────────────────────────────────────────────────────
// Passo piccolo e CON TETTO: oltre MAX_INDENT_LEVEL non si indenta più,
// così i nodi profondi restano sempre leggibili e cliccabili.
const STEP = 14;            // px per livello
const MAX_INDENT_LEVEL = 5; // oltre questo livello l'indent si ferma

// ─── Tree Node ────────────────────────────────────────────────────────────────
function TreeNode({ node, level, openNodes, toggleNode }: {
  node: any; level: number;
  openNodes: Record<string, boolean>;
  toggleNode: (id: any) => void;
}) {
  const hasChildren = node.children?.length > 0;
  const isOpen = openNodes[node.id];

  const isMacro = !!node.isMacro;
  const structural = isStructuralNode(node.eswbs_code);
  const icon = isMacro || level === 0 ? rootIconFor(node.eswbs_code) : null;

  const nameStyle = isMacro
    ? { color: "#789fd6", fontWeight: "800" as const, fontSize: 15 }
    : structural
      ? { color: "#ffffff", fontStyle: "italic" as const, fontSize: 13 }
      : level === 0
        ? { color: "#fff", fontWeight: "700" as const, fontSize: 14 }
        : level === 1
          ? { color: "#ffffffe6", fontSize: 14 }
          : { color: "#ffffffb3", fontSize: 13 };

  // Tap sulla riga = espandi/collassa (azione più frequente);
  // se è una foglia naviga al dettaglio.
  const onRowPress = () => {
    if (hasChildren) toggleNode(node.id);
    else if (!isMacro) router.push(`/(app)/impianti/${node.id}` as any);
  };

  const goToDetail = () => {
    if (!isMacro) router.push(`/(app)/impianti/${node.id}` as any);
  };

  const depth = Math.min(level, MAX_INDENT_LEVEL);

  return (
    <View>
      <TouchableOpacity
        activeOpacity={0.6}
        onPress={onRowPress}
        style={{
          flexDirection: "row",
          alignItems: "center",
          minHeight: 52,                  // riga alta = tap-target ampio
          paddingRight: 4,
          backgroundColor: isMacro ? "#789fd610" : "transparent",
          borderBottomWidth: 1,
          borderBottomColor: "#ffffff10",
        }}
      >
        {/* Guide verticali di profondità (sottili: non spingono via il testo) */}
        {Array.from({ length: depth }).map((_, i) => (
          <View key={i} style={{ width: STEP, alignItems: "center", alignSelf: "stretch" }}>
            <View style={{ width: 1, flex: 1, backgroundColor: "#789fd622" }} />
          </View>
        ))}

        {/* Chevron espandi/collassa: bottone GRANDE */}
        <TouchableOpacity
          onPress={onRowPress}
          hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
          style={{ width: 40, height: 52, alignItems: "center", justifyContent: "center" }}
        >
          {hasChildren ? (
            <Ionicons name={isOpen ? "chevron-down" : "chevron-forward"} size={20} color="#cfe0f5" />
          ) : (
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#ffffff33" }} />
          )}
        </TouchableOpacity>

        {/* Icona (macro / root) */}
        {icon && (
          <Ionicons name={icon} size={18} color="#ffffff99" style={{ marginRight: 8, opacity: 0.8 }} />
        )}

        {/* Codice + nome */}
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8 }}>
          <Text style={{ color: "#ffffff80", fontSize: 12, fontFamily: "monospace" }}>
            {node.eswbs_code}
          </Text>
          <Text style={[nameStyle, { flexShrink: 1 }]} numberOfLines={2}>{node.name}</Text>
        </View>

        {/* Apri dettaglio: bottone grande a destra (non per i macro) */}
        {!isMacro && (
          <TouchableOpacity
            onPress={goToDetail}
            hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
            style={{ width: 44, height: 52, alignItems: "center", justifyContent: "center" }}
          >
            <Ionicons name="open-outline" size={18} color="#789fd6" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* Figli */}
      {hasChildren && isOpen && node.children.map((child: any) => (
        <TreeNode key={child.id} node={child} level={level + 1}
          openNodes={openNodes} toggleNode={toggleNode} />
      ))}
    </View>
  );
}

// ─── Impianti Page ────────────────────────────────────────────────────────────
export default function ImpiantiPage() {
  const user = useSelector((state: RootState) => state.auth?.user) as any;
  const { t } = useTranslation("facilities");
  const { isTablet } = useDevice();

  const [elements,  setElements]  = useState<any[]>([]);
  const [filtered,  setFiltered]  = useState<any[]>([]);
  const [openNodes, setOpenNodes] = useState<Record<string, boolean>>({});
  const [search,    setSearch]    = useState("");
  const [loading,   setLoading]   = useState(true);
  const [isOnline,  setIsOnline]  = useState(true);
  const [fromCache, setFromCache] = useState(false);

  const shipId = String(user?.teamInfo?.assignedShip?.id || "");
  const teamId = String(user?.teamInfo?.teamId || "");

  useEffect(() => {
    const unsub = NetInfo.addEventListener((s) =>
      setIsOnline(!!(s.isConnected && s.isInternetReachable))
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    const key = ELEMENTS_CACHE(shipId, teamId);

    const load = async () => {
      setLoading(true);
      const net = await NetInfo.fetch();
      const online = !!(net.isConnected && net.isInternetReachable);

      if (online) {
        try {
          const raw = await fetchElements(shipId, String(user.id), teamId);
          const data = groupByMacro(sortTree(raw));
          setElements(data);
          setFiltered(data);
          setFromCache(false);
          await AsyncStorage.setItem(key, JSON.stringify(raw)); // salvo i dati grezzi
        } catch {
          await loadFromCache(key);
        }
      } else {
        await loadFromCache(key);
      }
      setLoading(false);
    };

    const loadFromCache = async (k: string) => {
      try {
        const raw = await AsyncStorage.getItem(k);
        if (raw) {
          const data = groupByMacro(sortTree(JSON.parse(raw)));
          setElements(data);
          setFiltered(data);
          setFromCache(true);
        } else {
          setElements([]); setFiltered([]); setFromCache(true);
        }
      } catch { setElements([]); setFiltered([]); }
    };

    load();
  }, [user]);

  useEffect(() => {
    if (!isOnline || !fromCache || !user?.id) return;
    const key = ELEMENTS_CACHE(shipId, teamId);
    fetchElements(shipId, String(user.id), teamId)
      .then(async (raw) => {
        const data = groupByMacro(sortTree(raw));
        setElements(data);
        setFiltered(filterTree(data, search));
        setFromCache(false);
        await AsyncStorage.setItem(key, JSON.stringify(raw));
      })
      .catch(() => {});
  }, [isOnline]);

  useEffect(() => {
    const result = filterTree(elements, search);
    setFiltered(result);
    if (search.trim()) setOpenNodes(expandAll(elements));
  }, [search, elements]);

  const toggleNode = (id: any) =>
    setOpenNodes((p) => ({ ...p, [id]: !p[id] }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#001c38" }}>
      <View style={{ flex: 1, padding: isTablet ? 24 : 16, alignSelf: "center",
        width: "100%", maxWidth: isTablet ? 1000 : "100%" }}>
        <DashboardHeader />

        <Text style={{ color: "#fff", fontSize: 22, fontWeight: "700", marginTop: 16,
          marginBottom: fromCache || !isOnline ? 8 : 14 }}>
          {t("facilities")}
        </Text>

        {!isOnline && (
          <View style={{ backgroundColor: "#F47216", borderRadius: 8, padding: 10,
            marginBottom: 12, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="cloud-offline-outline" size={14} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
              Offline — {fromCache ? "dati dalla cache locale" : "nessun dato disponibile"}
            </Text>
          </View>
        )}
        {isOnline && fromCache && (
          <View style={{ backgroundColor: "#789fd6", borderRadius: 8, padding: 10,
            marginBottom: 12, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="sync-outline" size={14} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>Aggiornamento in corso...</Text>
          </View>
        )}

        {/* Search */}
        <View style={{ backgroundColor: "#022a52", borderRadius: 8, flexDirection: "row",
          alignItems: "center", paddingHorizontal: 12, marginBottom: 12 }}>
          <Ionicons name="search-outline" size={18} color="#ffffff80" />
          <TextInput value={search} onChangeText={setSearch}
            placeholder={t("facilities_search")} placeholderTextColor="#6b7280"
            style={{ flex: 1, color: "#fff", padding: 10 }} />
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
                  <Ionicons name={fromCache && !search ? "cloud-offline-outline" : "construct-outline"}
                    size={48} color="#789fd6" />
                  <Text style={{ color: "#789fd6", marginTop: 12, textAlign: "center" }}>
                    {fromCache && !search
                      ? "Nessun dato in cache.\nConnettiti per scaricare gli impianti."
                      : t("no_results", { defaultValue: "Nessun risultato" })}
                  </Text>
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