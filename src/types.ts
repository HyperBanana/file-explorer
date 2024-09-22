export type FileTreeItem = {
    id: string;
    title: string;
    children?: FileTreeItem[];
    file?: string | null;
};

export type Keyable = {
    [key: string]: string;
};
