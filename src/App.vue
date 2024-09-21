<script setup>
import { ref, onMounted, watch } from 'vue';

const fileTree = ref(null);
const activeItem = ref([]);

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
                    id: `node-${path}-${index}`,
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

                // Sort the current level
                currentLevel.sort((a, b) => {
                    if (a.children && !b.children) return -1; // Folders first
                    if (!a.children && b.children) return 1; // Files last
                    return a.title.localeCompare(b.title); // Alphabetical within each group
                });
            }

            if (index < parts.length - 1) {
                currentLevel = existingPath.children;
            }
        });
    });

    return tree;
};

const handleKeyDown = (event) => {
    if (event.key === 'Delete' && activeItem.value.length > 0) {
        deleteItem(activeItem.value[0]);
    }
};

const deleteItem = (itemId) => {
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

    deleteFromTree(fileTree.value, itemId);
    activeItem.value = [];
};

onMounted(() => {
    fetchFileTree();
    window.addEventListener('keydown', handleKeyDown);
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
                        v-model:activated="activeItem"
                        :items="fileTree"
                        item-title="title"
                        item-children="children"
                        item-value="id"
                        activatable
                    >
                        <template #prepend="{ item }">
                            <v-icon v-if="item.children">
                                {{
                                    item.children.length > 0
                                        ? 'mdi-folder-open'
                                        : 'mdi-folder'
                                }}
                            </v-icon>
                            <v-icon v-else>
                                {{ getFileIcon(item.file) }}
                            </v-icon>
                        </template>
                        <template #label="{ item }">
                            {{ item.title }}
                            <span v-if="item.file" class="text-caption ml-2"
                                >({{ item.file }})</span
                            >
                        </template>
                    </v-treeview>
                </div>
                <div v-else>Loading...</div>
            </v-container>
        </v-main>
    </v-app>
</template>

<style scoped>
.v-treeview-node__root {
    min-height: 30px;
}
</style>
