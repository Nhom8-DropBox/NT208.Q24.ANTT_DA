export const getInitials = (name) => {
    if (!name || name === "Loading..." || name === "Guest") return "??";

    const words = name.split(" ");

    if (words.length > 1) {
        return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }

    // Trường hợp tên chỉ có 1 từ (Ví dụ: "An" -> "AN")
    return name.slice(0, 2).toUpperCase();
};