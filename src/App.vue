<script setup>
import { ref, onMounted, watch, computed, reactive } from 'vue';
import { v4 as uuidv4 } from 'uuid';

const fileTree = ref(null);
const expandedItems = ref([]);
const showAddModal = ref(false);
const newItemName = ref('');
const selectedDirectory = ref(null);
const isAddingFolder = ref(false);
const expandedModalItems = ref([]);
const activatedItems = ref([]);

const fileIcons = {
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
};

const getFileIcon = (fileExtension) => {
    return fileIcons[fileExtension] || 'mdi-file-outline';
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

const directoriesOnly = computed(() => {
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

    if (fileTree.value) {
        const filteredTree = filterDirectories(fileTree.value);
        return reactive([
            {
                id: 'root',
                title: 'Root',
                children: filteredTree,
            },
        ]);
    } else {
        return [];
    }
});

const addItem = () => {
    if (!newItemName.value) return;

    const newItem = {
        id: uuidv4(),
        title: newItemName.value,
    };

    if (isAddingFolder.value) {
        newItem.children = [];
    } else {
        const extensionMatch = newItemName.value.match(/\.([0-9a-z]+)$/i);
        newItem.file = extensionMatch ? extensionMatch[1].toLowerCase() : null;
    }

    const addToDirectory = (tree, dirId) => {
        if (dirId === 'root') {
            tree.push(newItem);
            sortItems(tree);
            return true;
        }
        for (let item of tree) {
            if (item.id === dirId) {
                if (!item.children) item.children = [];
                item.children.push(newItem);
                sortItems(item.children);
                return true;
            }
            if (item.children && addToDirectory(item.children, dirId)) {
                return true;
            }
        }
        return false;
    };

    if (selectedDirectory.value.id === 'root') {
        addToDirectory(fileTree.value, 'root');
    } else {
        addToDirectory(fileTree.value, selectedDirectory.value.id);
    }

    showAddModal.value = false;
    newItemName.value = '';
    selectedDirectory.value = null;
    activatedItems.value = [];
};

const deleteItem = (item) => {
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
};

const openAddModal = (isFolder) => {
    isAddingFolder.value = isFolder;
    showAddModal.value = true;
    // Expand all folders in the modal treeview
    expandedModalItems.value = [
        'root',
        ...directoriesOnly.value[0].children.map((item) => item.id),
    ];
    activatedItems.value = [];
    selectedDirectory.value = null;
};

const handleSelection = (items) => {
    const item = items[0];
    if (item) {
        selectedDirectory.value = item;
    } else {
        selectedDirectory.value = null;
    }
};

onMounted(() => {
    fetchFileTree();
});

watch(
    fileTree,
    () => {
        if (fileTree.value) {
            localStorage.setItem('fileTree', JSON.stringify(fileTree.value));
        }
    },
    { deep: true }
);
</script>

<template>
    <v-app theme="custom">
        <v-main>
            <v-container>
                <h1 class="text-h4 mb-4">File Explorer</h1>
                <div class="mb-4">
                    <v-btn class="mr-2" @click="openAddModal(false)"
                        >Add File</v-btn
                    >
                    <v-btn @click="openAddModal(true)">Add Folder</v-btn>
                </div>
                <div v-if="fileTree" class="filetree-container">
                    <v-treeview
                        v-model:open="expandedItems"
                        :items="fileTree"
                        item-title="title"
                        item-children="children"
                        item-value="id"
                        open-on-click
                        density="compact"
                    >
                        <template #prepend="{ item }">
                            <v-icon>
                                {{
                                    item.children
                                        ? getFolderIcon(item)
                                        : getFileIcon(item.file)
                                }}
                            </v-icon>
                        </template>
                        <template #append="{ item }">
                            <v-menu>
                                <template #activator="{ props }">
                                    <v-btn
                                        icon="mdi-dots-vertical"
                                        variant="text"
                                        v-bind="props"
                                        size="small"
                                    ></v-btn>
                                </template>
                                <v-list>
                                    <v-list-item @click="deleteItem(item)">
                                        <v-list-item-title
                                            >Delete</v-list-item-title
                                        >
                                    </v-list-item>
                                </v-list>
                            </v-menu>
                        </template>
                    </v-treeview>
                </div>
                <div v-else>Loading...</div>
            </v-container>
        </v-main>

        <v-dialog v-model="showAddModal" max-width="500px">
            <v-card>
                <v-card-title>
                    <span class="text-h5"
                        >Add {{ isAddingFolder ? 'Folder' : 'File' }}</span
                    >
                </v-card-title>
                <v-card-text>
                    <v-text-field
                        v-model="newItemName"
                        :label="isAddingFolder ? 'Folder Name' : 'File Name'"
                        required
                    ></v-text-field>
                    <v-select
                        v-model="selectedDirectory"
                        :items="directoriesOnly"
                        item-title="title"
                        item-value="id"
                        label="Select Directory"
                        required
                        return-object
                    >
                        <template #selection="{ item }">
                            {{ item.title }}
                        </template>
                        <template #item="">
                            <v-treeview
                                :items="directoriesOnly"
                                activatable
                                density="compact"
                                item-children="children"
                                return-object
                                open-all
                                @update:activated="handleSelection"
                            >
                                <template #prepend="{ item }">
                                    <v-icon>
                                        {{ getFolderIcon(item) }}
                                    </v-icon>
                                </template>
                            </v-treeview>
                        </template>
                    </v-select>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="blue-darken-1"
                        variant="text"
                        @click="showAddModal = false"
                    >
                        Cancel
                    </v-btn>
                    <v-btn
                        color="blue-darken-1"
                        variant="text"
                        @click="addItem"
                    >
                        Add
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-app>
</template>
