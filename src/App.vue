<script setup lang="ts">
import { onMounted, watch, ref } from 'vue';
import { useFileTree } from './composables/useFileTree';
import { useAddItem } from './composables/useAddItem';
import FileTree from './components/FileTree.vue';
import AddItemModal from './components/AddItemModal.vue';

const { fileTree, expandedItems, directories, fetchFileTree, deleteItem } =
    useFileTree();

const {
    showAddModal,
    newItemName,
    selectedDirectory,
    isAddingFolder,
    expandedModalItems,
    activatedItems,
    addItem,
    openAddModal,
    handleSelection,
} = useAddItem(fileTree);

const showAddMenu = ref(false);

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

const handleAddItem = (isFolder: boolean) => {
    showAddMenu.value = false;
    openAddModal(isFolder);
};
</script>

<template>
    <v-app theme="custom">
        <v-main>
            <v-container>
                <h1>File Explorer</h1>
                <div class="actions-container">
                    <v-menu v-model="showAddMenu">
                        <template v-slot:activator="{ props }">
                            <v-btn color="secondary" v-bind="props">
                                Add
                                <v-icon right>mdi-menu-down</v-icon>
                            </v-btn>
                        </template>
                        <v-list>
                            <v-list-item @click="handleAddItem(false)">
                                <v-list-item-title>Add File</v-list-item-title>
                            </v-list-item>
                            <v-list-item @click="handleAddItem(true)">
                                <v-list-item-title
                                    >Add Folder</v-list-item-title
                                >
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </div>
                <div v-if="fileTree" class="filetree-container">
                    <FileTree
                        :items="fileTree"
                        :expanded-items="expandedItems"
                        @update:expanded-items="expandedItems = $event"
                        @delete-item="deleteItem"
                    />
                </div>
                <div v-else>Loading...</div>
            </v-container>
        </v-main>

        <AddItemModal
            v-model="showAddModal"
            v-model:new-item-name="newItemName"
            v-model:selected-directory="selectedDirectory"
            :directories="directories"
            :expanded-modal-items="expandedModalItems"
            :activated-items="activatedItems"
            :is-adding-folder="isAddingFolder"
            @add-item="addItem"
            @handle-selection="handleSelection"
        />
    </v-app>
</template>
