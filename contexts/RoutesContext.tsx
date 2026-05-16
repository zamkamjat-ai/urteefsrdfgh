import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type StopType = "pickup" | "delivery" | "stop";
export type StopStatus = "pending" | "visited" | "skipped";
export type RouteStatus = "pending" | "in-progress" | "completed";

export interface Stop {
  id: string;
  order: number;
  locationName: string;
  address: string;
  city: string;
  type: StopType;
  contactName?: string;
  phone?: string;
  notes?: string;
  status: StopStatus;
}

export interface Route {
  id: string;
  name: string;
  date: string;
  driverName: string;
  status: RouteStatus;
  stops: Stop[];
}

interface RoutesContextType {
  routes: Route[];
  addRoute: (route: Route) => void;
  updateRoute: (route: Route) => void;
  deleteRoute: (id: string) => void;
  updateStopStatus: (routeId: string, stopId: string, status: StopStatus) => void;
  getRouteById: (id: string) => Route | undefined;
}

const RoutesContext = createContext<RoutesContextType | undefined>(undefined);

const STORAGE_KEY = "driver_routes_v1";

const SAMPLE_ROUTES: Route[] = [
  {
    id: "route-001",
    name: "North Zone Morning Run",
    date: new Date().toISOString().split("T")[0],
    driverName: "Alex Johnson",
    status: "in-progress",
    stops: [
      {
        id: "stop-1",
        order: 1,
        locationName: "Central Warehouse",
        address: "12 Industrial Ave",
        city: "Springfield",
        type: "pickup",
        contactName: "Tom Richards",
        phone: "555-0101",
        notes: "Load dock B, 8:00 AM slot",
        status: "visited",
      },
      {
        id: "stop-2",
        order: 2,
        locationName: "Maple Grocery Store",
        address: "340 Maple Street",
        city: "Springfield",
        type: "delivery",
        contactName: "Sarah Lee",
        phone: "555-0202",
        notes: "Back entrance, ring bell",
        status: "visited",
      },
      {
        id: "stop-3",
        order: 3,
        locationName: "Green Valley Pharmacy",
        address: "87 Valley Road",
        city: "Riverside",
        type: "delivery",
        contactName: "Mark Chen",
        phone: "555-0303",
        notes: "Refrigerated items — priority",
        status: "pending",
      },
      {
        id: "stop-4",
        order: 4,
        locationName: "Riverside School",
        address: "201 School Lane",
        city: "Riverside",
        type: "delivery",
        contactName: "Principal Davies",
        phone: "555-0404",
        notes: "Before 11:00 AM",
        status: "pending",
      },
      {
        id: "stop-5",
        order: 5,
        locationName: "East Side Depot",
        address: "90 Depot Blvd",
        city: "Eastville",
        type: "stop",
        contactName: "Frank Miller",
        phone: "555-0505",
        notes: "Fuel stop + break",
        status: "pending",
      },
    ],
  },
  {
    id: "route-002",
    name: "South District Afternoon",
    date: new Date().toISOString().split("T")[0],
    driverName: "Maria Santos",
    status: "pending",
    stops: [
      {
        id: "stop-6",
        order: 1,
        locationName: "South Warehouse",
        address: "5 Harbor Way",
        city: "Southport",
        type: "pickup",
        contactName: "Luis Gomez",
        phone: "555-0601",
        notes: "Bay 3",
        status: "pending",
      },
      {
        id: "stop-7",
        order: 2,
        locationName: "Harbor Hotel",
        address: "22 Oceanview Drive",
        city: "Southport",
        type: "delivery",
        contactName: "Reception Desk",
        phone: "555-0700",
        notes: "Perishables — check in at front desk",
        status: "pending",
      },
      {
        id: "stop-8",
        order: 3,
        locationName: "Marina Fish Market",
        address: "67 Pier Street",
        city: "Southport",
        type: "delivery",
        contactName: "Danny Walsh",
        phone: "555-0802",
        notes: "Morning supply replenishment",
        status: "pending",
      },
    ],
  },
  {
    id: "route-003",
    name: "West District Route",
    date: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return d.toISOString().split("T")[0];
    })(),
    driverName: "James Kirk",
    status: "pending",
    stops: [
      {
        id: "stop-9",
        order: 1,
        locationName: "West Hub Facility",
        address: "100 Commerce Blvd",
        city: "Westburg",
        type: "pickup",
        contactName: "Anna Price",
        phone: "555-0901",
        notes: "Full truck load",
        status: "pending",
      },
      {
        id: "stop-10",
        order: 2,
        locationName: "TechCorp HQ",
        address: "450 Innovation Drive",
        city: "Westburg",
        type: "delivery",
        contactName: "IT Dept",
        phone: "555-1001",
        notes: "Fragile hardware — sign required",
        status: "pending",
      },
      {
        id: "stop-11",
        order: 3,
        locationName: "Sunset Retail Park",
        address: "780 Sunset Blvd",
        city: "Westburg",
        type: "delivery",
        contactName: "Store Manager",
        phone: "555-1101",
        notes: "Use loading bay 2",
        status: "pending",
      },
    ],
  },
];

export function RoutesProvider({ children }: { children: React.ReactNode }) {
  const [routes, setRoutes] = useState<Route[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setRoutes(JSON.parse(stored));
        } else {
          setRoutes(SAMPLE_ROUTES);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_ROUTES));
        }
      } catch {
        setRoutes(SAMPLE_ROUTES);
      }
    })();
  }, []);

  const save = useCallback(async (updated: Route[]) => {
    setRoutes(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }, []);

  const addRoute = useCallback(
    (route: Route) => {
      save([...routes, route]);
    },
    [routes, save]
  );

  const updateRoute = useCallback(
    (route: Route) => {
      save(routes.map((r) => (r.id === route.id ? route : r)));
    },
    [routes, save]
  );

  const deleteRoute = useCallback(
    (id: string) => {
      save(routes.filter((r) => r.id !== id));
    },
    [routes, save]
  );

  const updateStopStatus = useCallback(
    (routeId: string, stopId: string, status: StopStatus) => {
      const updated = routes.map((r) => {
        if (r.id !== routeId) return r;
        const updatedStops = r.stops.map((s) =>
          s.id === stopId ? { ...s, status } : s
        );
        const allVisited = updatedStops.every((s) => s.status !== "pending");
        const anyVisited = updatedStops.some((s) => s.status === "visited");
        const newStatus: RouteStatus = allVisited
          ? "completed"
          : anyVisited
          ? "in-progress"
          : "pending";
        return { ...r, stops: updatedStops, status: newStatus };
      });
      save(updated);
    },
    [routes, save]
  );

  const getRouteById = useCallback(
    (id: string) => routes.find((r) => r.id === id),
    [routes]
  );

  return (
    <RoutesContext.Provider
      value={{
        routes,
        addRoute,
        updateRoute,
        deleteRoute,
        updateStopStatus,
        getRouteById,
      }}
    >
      {children}
    </RoutesContext.Provider>
  );
}

export function useRoutes() {
  const ctx = useContext(RoutesContext);
  if (!ctx) throw new Error("useRoutes must be used within RoutesProvider");
  return ctx;
}
