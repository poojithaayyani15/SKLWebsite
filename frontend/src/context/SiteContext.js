import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { COMPANY as STATIC_COMPANY } from "@/data/content";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const SiteContext = createContext(null);

const digits = (s) => (s || "").replace(/[^\d]/g, "");

export function SiteProvider({ children }) {
  const [company, setCompany] = useState(STATIC_COMPANY);
  const [openings, setOpenings] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API}/public/settings`);
        if (data && Object.keys(data).length) {
          setCompany({
            ...STATIC_COMPANY,
            name: data.company_name || STATIC_COMPANY.name,
            positioning: data.positioning || STATIC_COMPANY.positioning,
            tagline: data.tagline || STATIC_COMPANY.tagline,
            address: data.address || STATIC_COMPANY.address,
            phone: data.phone || STATIC_COMPANY.phone,
            phoneRaw: data.phone ? `+${digits(data.phone)}` : STATIC_COMPANY.phoneRaw,
            whatsapp: data.whatsapp || STATIC_COMPANY.whatsapp,
            whatsappRaw: data.whatsapp ? digits(data.whatsapp) : STATIC_COMPANY.whatsappRaw,
            email: data.email || STATIC_COMPANY.email,
            hours: data.hours || STATIC_COMPANY.hours,
            partnership: data.partnership || STATIC_COMPANY.partnership,
            linkedin: data.linkedin || "",
            twitter: data.twitter || "",
            facebook: data.facebook || "",
          });
        }
      } catch { /* fallback to static */ }
      try {
        const { data } = await axios.get(`${API}/public/careers`);
        setOpenings(data);
      } catch { /* fallback to static */ }
    })();
  }, []);

  return <SiteContext.Provider value={{ company, openings }}>{children}</SiteContext.Provider>;
}

export const useSite = () => useContext(SiteContext) || { company: STATIC_COMPANY, openings: null };
export const useCompany = () => useSite().company;
