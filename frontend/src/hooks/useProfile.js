import { fetchWithAuth } from "../utils/api"
import { useState, useEffect } from "react";

export const useProfile = () => {
    const [email, setEmail] = useState(null);
    useEffect(() => {
        const fetchProfile = async () => {
            const res = await fetchWithAuth('/dashboard/profile');
            if (res.ok) {
                const data = await res.json();
                setEmail(data.user.email);
            }
        };
        fetchProfile();

    }, []); // [] → chỉ chạy 1 lần khi component mount

    const formatEmailToName = (email) => {
        if (!email) return "Guest";

        let namePart = email.split('@')[0];


        namePart = namePart.replace(/[._]/g, ' ');

        return namePart.replace(/\b\w/g, (char) => char.toUpperCase());
    };
    let name = email ? formatEmailToName(email) : "Loading...";
    if (!email?.includes('@')) setEmail(name + "@gmail.com");

    return { name, email };
} 