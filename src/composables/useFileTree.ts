import { computed, reactive, ref, Ref, watch } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { FileTreeItem, Keyable } from '../types';

export function useFileTree() {
    const fileTree: Ref<FileTreeItem[] | null> = ref(null);
    const expandedItems = ref<string[]>([]);

    const fileIcons: Keyable = {
        html: 'mdi-language-html5',
        js: 'mdi-nodejs',
        json: 'mdi-code-json',
        md: 'mdi-language-markdown',
        pdf: 'mdi-file-pdf-box',
        png: 'mdi-file-image',
        jpg: 'mdi-file-image',
        jpeg: 'mdi-file-image',
        gif: 'mdi-file-image',
        txt: 'mdi-file-document-outline',
        py: 'mdi-language-python',
        cs: 'mdi-language-csharp',
        java: 'mdi-language-java',
        css: 'mdi-language-css3',
        svg: 'mdi-svg',
    };

    const directories = computed(() => {
        const root = reactive({
            id: 'root',
            title: 'Root',
            children: [],
        });

        if (fileTree.value) {
            const filteredTree = filterDirectories(fileTree.value);
            root.children = filteredTree;
        }

        return [root];
    });

    const filterDirectories = (items) => {
        return items.reduce((acc, item) => {
            if (item.children) {
                const newItem = reactive({ ...item });
                newItem.children = filterDirectories(item.children);
                acc.push(newItem);
            }
            return acc;
        }, []);
    };

    const getFileIcon = (fileExtension: string): string => {
        return fileIcons[fileExtension] || 'mdi-file-outline';
    };

    const getFolderIcon = (item: FileTreeItem): string => {
        return item.children && item.children.length > 0
            ? 'mdi-folder-open'
            : 'mdi-folder';
    };

    const fetchFileTree = async () => {
        try {
            const storedTree = localStorage.getItem('fileTree');
            if (storedTree) {
                fileTree.value = JSON.parse(storedTree);
            } else {
                const response = await fetch(
                    'https://ab-file-explorer.athleticnext.workers.dev/?file=regular'
                );
                const data = await response.json();
                fileTree.value = processFileTree(data.filepaths);
                localStorage.setItem(
                    'fileTree',
                    JSON.stringify(fileTree.value)
                );
            }
        } catch (error) {
            console.error('Error fetching file tree:', error);
        }
    };

    const processFileTree = (filepaths: string[]): FileTreeItem[] => {
        const tree: FileTreeItem[] = [];

        filepaths.forEach((path) => {
            const parts = path.split('/');
            let currentLevel = tree;

            parts.forEach((part, index) => {
                let existingPath = currentLevel.find((p) => p.title === part);
                if (!existingPath) {
                    existingPath = {
                        id: uuidv4(),
                        title: part,
                    };

                    if (index === parts.length - 1) {
                        // It's a file
                        const extensionMatch = part.match(/\.([0-9a-z]+)$/i);
                        existingPath.file = extensionMatch
                            ? extensionMatch[1].toLowerCase()
                            : null;
                    } else {
                        // It's a folder
                        existingPath.children = [];
                    }

                    currentLevel.push(existingPath);
                    sortItems(currentLevel);
                }

                if (index < parts.length - 1) {
                    currentLevel = existingPath.children!;
                }
            });
        });

        return tree;
    };

    const sortItems = (items: FileTreeItem[]): void => {
        items.sort((a, b) => {
            if (a.children && !b.children) return -1;
            if (!a.children && b.children) return 1;
            return a.title.localeCompare(b.title);
        });
    };

    const deleteItem = (item: FileTreeItem): void => {
        const deleteFromTree = (tree: FileTreeItem[], id: string): boolean => {
            for (let i = 0; i < tree.length; i++) {
                if (tree[i].id === id) {
                    tree.splice(i, 1);
                    return true;
                }
                if (tree[i].children) {
                    if (deleteFromTree(tree[i].children!, id)) {
                        if (tree[i].children!.length === 0) {
                            delete tree[i].children;
                        }
                        return true;
                    }
                }
            }
            return false;
        };

        if (fileTree.value) {
            deleteFromTree(fileTree.value, item.id);
        }
    };

    watch(fileTree, () => {
        // This will trigger a recomputation of the directories computed property
        // You can add additional logic here if needed
    });

    return {
        fileTree,
        expandedItems,
        directories,
        getFileIcon,
        getFolderIcon,
        fetchFileTree,
        deleteItem,
        sortItems,
    };
}
