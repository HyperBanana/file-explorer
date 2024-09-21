<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { v4 as uuidv4 } from 'uuid';

const fileTree = ref(null);
const activeItemId = ref([]);
const expandedItems = ref([]);
const showContextMenu = ref(false);
const contextMenuPosition = ref({ x: 0, y: 0 });
const contextMenuTarget = ref(null);

const fileIcons = ref({
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
    xls: 'mdi-file-excel',
    xlsx: 'mdi-file-excel',
    doc: 'mdi-file-word',
    docx: 'mdi-file-word',
    ppt: 'mdi-file-powerpoint',
    pptx: 'mdi-file-powerpoint',
    py: 'mdi-language-python',
    cpp: 'mdi-language-cpp',
    cs: 'mdi-language-csharp',
    java: 'mdi-language-java',
    css: 'mdi-language-css3',
    svg: 'mdi-svg',
});

const getFileIcon = (fileExtension) => {
    return fileIcons.value[fileExtension] || 'mdi-file-outline';
};

const getFolderIcon = (item) => {
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
            fileTree.value = processFileTree(data);
            localStorage.setItem('fileTree', JSON.stringify(fileTree.value));
        }
    } catch (error) {
        console.error('Error fetching file tree:', error);
    }
};

const processFileTree = (data) => {
    const tree = [];

    data.filepaths.forEach((path) => {
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
                currentLevel = existingPath.children;
            }
        });
    });

    return tree;
};

const sortItems = (items) => {
    items.sort((a, b) => {
        if (a.children && !b.children) return -1; // Folders first
        if (!a.children && b.children) return 1; // Files last
        return a.title.localeCompare(b.title); // Alphabetical within each group
    });
};

const handleContextMenu = (event, item) => {
    event.preventDefault();
    event.stopPropagation();
    activeItemId.value = item.id;
    showContextMenu.value = false;
    const rect = event.target.getBoundingClientRect();
    contextMenuPosition.value = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
    };
    contextMenuTarget.value = item;
    showContextMenu.value = true;
};

const closeContextMenu = () => {
    showContextMenu.value = false;
};

const addItem = (isFolder) => {
    const clickedItem = contextMenuTarget.value;

    const findParent = (tree, targetId) => {
        for (let item of tree) {
            if (item.id === targetId) {
                return tree;
            }
            if (item.children) {
                const result = findParent(item.children, targetId);
                if (result) return result;
            }
        }
        return null;
    };

    const parentChildren =
        clickedItem.children || findParent(fileTree.value, clickedItem.id);

    if (!parentChildren) {
        console.error("Couldn't find parent");
        return;
    }

    const newItemName = prompt(`Enter ${isFolder ? 'folder' : 'file'} name:`);
    if (!newItemName) return;

    if (parentChildren.some((item) => item.title === newItemName)) {
        alert('An item with that name already exists in this directory');
        return;
    }

    const newItem = {
        id: uuidv4(),
        title: newItemName,
    };

    if (isFolder) {
        newItem.children = [];
    } else {
        const extensionMatch = newItemName.match(/\.([0-9a-z]+)$/i);
        newItem.file = extensionMatch ? extensionMatch[1].toLowerCase() : null;
    }

    parentChildren.push(newItem);
    sortItems(parentChildren);

    // Expand the folder if a new item is added
    if (clickedItem.children) {
        if (!expandedItems.value.includes(clickedItem.id)) {
            expandedItems.value.push(clickedItem.id);
        }
    } else {
        // If we're adding to a file's parent, expand the parent folder
        const parentFolder = fileTree.value.find(
            (item) => item.children === parentChildren
        );
        if (parentFolder && !expandedItems.value.includes(parentFolder.id)) {
            expandedItems.value.push(parentFolder.id);
        }
    }

    closeContextMenu();
};

const deleteItem = (item) => {
    if (!item) return;

    const deleteFromTree = (tree, id) => {
        for (let i = 0; i < tree.length; i++) {
            if (tree[i].id === id) {
                tree.splice(i, 1);
                return true;
            }
            if (tree[i].children) {
                if (deleteFromTree(tree[i].children, id)) {
                    if (tree[i].children.length === 0) {
                        delete tree[i].children;
                    }
                    return true;
                }
            }
        }
        return false;
    };

    deleteFromTree(fileTree.value, item.id);
    closeContextMenu();
};

const handleKeyDown = (event) => {
    if (event.key === 'Delete' && activeItemId.value.length > 0) {
        const item = fileTree.value.find(
            ({ id }) => id === activeItemId.value[0]
        );
        deleteItem(item);
    }
};

onMounted(() => {
    fetchFileTree();
    window.addEventListener('click', closeContextMenu);
    window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
    window.removeEventListener('click', closeContextMenu);
    window.removeEventListener('keydown', handleKeyDown);
});

watch(
    fileTree,
    () => {
        localStorage.setItem('fileTree', JSON.stringify(fileTree.value));
    },
    { deep: true }
);
</script>

<template>
    <v-app>
        <v-main>
            <v-container>
                <h1 class="text-h4 mb-4">File Explorer</h1>
                <div v-if="fileTree">
                    <v-treeview
                        v-model:activated="activeItemId"
                        v-model:open="expandedItems"
                        :items="fileTree"
                        item-title="title"
                        item-children="children"
                        item-value="id"
                        activatable
                        open-on-click
                        density="compact"
                    >
                        <template #prepend="{ item }">
                            <v-icon
                                @contextmenu.prevent.stop="
                                    handleContextMenu($event, item)
                                "
                            >
                                {{
                                    item.children
                                        ? getFolderIcon(item)
                                        : getFileIcon(item.file)
                                }}
                            </v-icon>
                        </template>
                        <template #append="{ item }">
                            <div
                                class="item-overlay"
                                @contextmenu.prevent.stop="
                                    handleContextMenu($event, item)
                                "
                            ></div>
                        </template>
                    </v-treeview>
                </div>
                <div v-else>Loading...</div>
            </v-container>
        </v-main>

        <v-menu
            v-model="showContextMenu"
            :position-x="contextMenuPosition.x"
            :position-y="contextMenuPosition.y"
            absolute
            :close-on-content-click="false"
            @click:outside="closeContextMenu"
        >
            <v-list>
                <v-list-item @click="addItem(true)">
                    <v-list-item-title>Add Folder</v-list-item-title>
                </v-list-item>
                <v-list-item @click="addItem(false)">
                    <v-list-item-title>Add File</v-list-item-title>
                </v-list-item>
                <v-list-item
                    v-if="contextMenuTarget"
                    @click="deleteItem(contextMenuTarget)"
                >
                    <v-list-item-title>Delete</v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
    </v-app>
</template>

<style scoped>
.v-treeview-node__root {
    min-height: 30px;
}

.v-list-item__overlay {
    position: relative;
}

.item-overlay {
    position: absolute;
    inset: 0;
}
</style>
