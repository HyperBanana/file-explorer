import { ref, Ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { FileTreeItem } from '../types';
import { useFileTree } from './useFileTree';

export function useAddItem(fileTree: Ref<FileTreeItem[] | null>) {
    const showAddModal = ref(false);
    const newItemName = ref('');
    const selectedDirectory = ref<FileTreeItem | null>(null);
    const isAddingFolder = ref(false);
    const expandedModalItems = ref<string[]>([]);
    const activatedItems = ref<string[]>([]);
    const { directories, sortItems } = useFileTree();

    const addItem = () => {
        if (!newItemName.value || !selectedDirectory.value || !fileTree.value)
            return;

        const newItem: FileTreeItem = {
            id: uuidv4(),
            title: newItemName.value,
        };

        if (isAddingFolder.value) {
            newItem.children = [];
        } else {
            const extensionMatch = newItemName.value.match(/\.([0-9a-z]+)$/i);
            newItem.file = extensionMatch
                ? extensionMatch[1].toLowerCase()
                : null;
        }

        if (selectedDirectory.value.id === 'root') {
            fileTree.value.push(newItem);
            sortItems(fileTree.value);
        } else {
            addToDirectory(fileTree.value, newItem, selectedDirectory.value.id);
        }

        showAddModal.value = false;
        newItemName.value = '';
        selectedDirectory.value = null;
        activatedItems.value = [];
    };

    const addToDirectory = (
        tree: FileTreeItem[],
        newItem: FileTreeItem,
        dirId: string
    ): boolean => {
        for (let item of tree) {
            if (item.id === dirId) {
                if (!item.children) item.children = [];
                item.children.push(newItem);
                sortItems(item.children);
                return true;
            }
            if (
                item.children &&
                addToDirectory(item.children, newItem, dirId)
            ) {
                return true;
            }
        }
        return false;
    };

    const openAddModal = (isFolder: boolean) => {
        isAddingFolder.value = isFolder;
        showAddModal.value = true;

        const rootChildren = directories.value[0]?.children || [];
        expandedModalItems.value = [
            'root',
            ...rootChildren.map((item: FileTreeItem) => item.id),
        ];

        activatedItems.value = [];
        selectedDirectory.value = null;
    };

    const handleSelection = (items: FileTreeItem[]) => {
        const item = items[0];
        if (item) {
            selectedDirectory.value = item;
        } else {
            selectedDirectory.value = null;
        }
    };

    return {
        showAddModal,
        newItemName,
        selectedDirectory,
        isAddingFolder,
        expandedModalItems,
        activatedItems,
        addItem,
        openAddModal,
        handleSelection,
    };
}
