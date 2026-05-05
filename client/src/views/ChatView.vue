<template>
  <MainLayout>
    <v-row class="ga-0 rounded-xl overflow-hidden dashboard-container" style="border: 1px solid #DFE2F1; background: white;">
      
      <!-- Sidebar Kiri: Daftar Kontak/Percakapan -->
      <v-col cols="12" md="4" lg="3" class="sidebar-border fill-height d-flex flex-column" style="background-color: white;">
        <!-- Header Sidebar -->
        <div class="pa-6 pb-2">
          <h1 class="text-h5 font-weight-bold" style="color: #2D3748;">Chat</h1>
        </div>

        <!-- Profil Saya (Singkat) -->
        <div class="px-6 py-4 mb-2">
          <v-card variant="tonal" color="#F7F9FC" class="pa-3 rounded-xl border-0" style="background-color: #F7F9FC !important;">
            <div class="d-flex align-center">
              <v-avatar color="#1DA88B" size="48" class="mr-3">
                <v-icon icon="mdi-account" color="white"></v-icon>
              </v-avatar>
              <div class="grow overflow-hidden">
                <div class="text-subtitle-2 font-weight-bold text-truncate" style="color: #2D3748;">
                  {{ authStore.user?.email }}
                </div>
                <div class="d-flex align-center">
                  <v-badge dot color="success" inline class="mr-1"></v-badge>
                  <span class="text-caption text-success">Online</span>
                </div>
              </div>
            </div>
          </v-card>
        </div>

        <!-- Bilah Pencarian -->
        <div class="px-6 mb-4">
          <v-text-field
            v-model="search"
            placeholder="Cari kontak..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="comfortable"
            hide-details
            rounded="lg"
            bg-color="#F7F9FC"
            class="search-field"
          ></v-text-field>
        </div>

        <!-- Daftar Kontak -->
        <div class="flex-grow-1 overflow-y-auto px-2">
          <div class="px-4 mb-2 text-overline" style="color: #718096;">Kontak</div>
          <v-list class="pa-0">
            <v-list-item
              v-for="contact in filteredContacts"
              :key="contact.id"
              :active="String(contact.id) === String(selectedUserId)"
              @click="selectUser(contact)"
              class="rounded-xl mx-2 mb-1 pa-3"
              color="#1DA88B"
              :style="String(contact.id) === String(selectedUserId) ? 'background-color: #DFF1EE !important;' : ''"
            >
              <template v-slot:prepend>
                <v-avatar color="#DFF1EE" size="40" class="mr-3">
                  <v-icon icon="mdi-account" color="#1DA88B"></v-icon>
                </v-avatar>
              </template>
              
              <v-list-item-title class="font-weight-bold" style="font-size: 0.9rem;">
                {{ contact.email.split('@')[0] }}
              </v-list-item-title>
              <v-list-item-subtitle class="text-truncate mr-2">
                {{ contact.email }}
              </v-list-item-subtitle>

              <template v-slot:append>
                <v-icon v-if="String(contact.id) === String(selectedUserId)" icon="mdi-chevron-right" size="16" color="#1DA88B"></v-icon>
              </template>
            </v-list-item>
          </v-list>
        </div>
      </v-col>

      <!-- Panel Kanan: Area Obrolan -->
      <v-col cols="12" md="8" lg="9" class="d-flex flex-column fill-height" style="background-color: white;">
        
        <!-- Layar Selamat Datang (Jika belum pilih user) -->
        <div v-if="!selectedUserId" class="fill-height d-flex flex-column align-center justify-center text-center pa-12" style="background-color: #F7F9FC;">
          <v-icon icon="mdi-shield-lock-outline" size="120" color="#CBD5E0" class="mb-6"></v-icon>
          <h2 class="text-h4 font-weight-bold mb-2" style="color: #2D3748;">SEChatbox</h2>
          <p class="text-body-1" style="color: #718096; max-width: 400px;">
            Pilih kontak di sebelah kiri untuk memulai obrolan yang aman dan terenkripsi end-to-end.
          </p>
          <v-chip color="#1DA88B" variant="tonal" class="mt-4">
            <v-icon start icon="mdi-lock"></v-icon>
            AES-256-CBC + X25519
          </v-chip>
        </div>

        <!-- Area Obrolan Aktif -->
        <template v-else>
          <!-- Header Obrolan -->
          <div class="pa-4 d-flex align-center border-bottom" style="background-color: white;">
            <v-avatar color="#DFF1EE" size="48" class="mr-4">
              <v-icon icon="mdi-account" color="#1DA88B"></v-icon>
            </v-avatar>
            <div class="flex-grow-1">
              <h2 class="text-subtitle-1 font-weight-bold" style="color: #2D3748; line-height: 1.2;">
                {{ activeContact?.email || 'Memuat...' }}
              </h2>
              <div class="d-flex align-center">
                <v-icon icon="mdi-lock" size="14" color="#1DA88B" class="mr-1"></v-icon>
                <span class="text-caption" style="color: #1DA88B;">
                  {{ isEncrypted ? 'Terenkripsi end-to-end' : 'Menyiapkan enkripsi...' }}
                </span>
              </div>
            </div>
            <!-- Tombol Cari / Input Cari -->
            <template v-if="!showMessageSearch">
              <v-btn icon="mdi-magnify" variant="text" color="#718096" @click="openMessageSearch"></v-btn>
            </template>
            <template v-else>
              <div class="d-flex align-center bg-grey-lighten-4 rounded-lg px-3 py-1 mr-2" style="min-width: 280px;">
                <v-text-field
                  v-model="messageSearchQuery"
                  placeholder="Cari pesan..."
                  variant="plain"
                  density="compact"
                  hide-details
                  autofocus
                  @keyup.enter="nextSearchResult"
                  class="search-input"
                  style="min-width: 150px;"
                ></v-text-field>
                <span v-if="searchMatches.length > 0" class="text-caption mx-2" style="color: #718096;">
                  {{ currentMatchIndex + 1 }}/{{ searchMatches.length }}
                </span>
                <span v-else-if="messageSearchQuery" class="text-caption mx-2" style="color: #718096;">
                  0/0
                </span>
                <v-btn
                  icon="mdi-chevron-up"
                  variant="text"
                  size="small"
                  density="compact"
                  :disabled="searchMatches.length === 0"
                  @click="prevSearchResult"
                ></v-btn>
                <v-btn
                  icon="mdi-chevron-down"
                  variant="text"
                  size="small"
                  density="compact"
                  :disabled="searchMatches.length === 0"
                  @click="nextSearchResult"
                ></v-btn>
                <v-btn
                  icon="mdi-close"
                  variant="text"
                  size="small"
                  density="compact"
                  @click="closeMessageSearch"
                ></v-btn>
              </div>
            </template>
          </div>

          <!-- Pesan -->
          <div
            ref="messagesContainer"
            class="flex-grow-1 pa-6 overflow-y-auto d-flex flex-column messages-area"
            style="background-color: #F7F9FC;"
          >
            <!-- Status Loading -->
            <div v-if="!isEncrypted" class="fill-height d-flex flex-column align-center justify-center">
              <v-progress-circular indeterminate color="#1DA88B" size="48"></v-progress-circular>
              <span class="mt-4 text-body-2" style="color: #718096;">Menyiapkan kunci aman...</span>
            </div>

            <!-- List Messages -->
            <template v-else>
              <div v-if="messages.length === 0" class="fill-height d-flex flex-column align-center justify-center opacity-50">
                <v-icon icon="mdi-message-outline" size="48" class="mb-2"></v-icon>
                <span>Belum ada pesan. Sapa mereka!</span>
              </div>
              
              <div
                v-for="message in messages"
                :key="message.id"
                class="d-flex mb-4"
                :class="[
                  message.isMe ? 'justify-end' : 'justify-start',
                  highlightedMessageId === message.id ? 'highlighted-message' : ''
                ]"
              >
                <!-- Avatar lawan bicara (hanya jika bukan diri sendiri) -->
                <v-avatar v-if="!message.isMe" size="32" class="mr-2 align-self-end mb-1" color="#DFF1EE">
                   <v-icon icon="mdi-account" size="18" color="#1DA88B"></v-icon>
                </v-avatar>

                <div class="d-flex flex-column" :class="message.isMe ? 'align-end' : 'align-start'" style="max-width: 70%;">
                  <v-card
                    :color="message.isMe ? '#1DA88B' : 'white'"
                    class="pa-4 rounded-xl"
                    elevation="0"
                    :style="[
                      message.isMe ? 'color: white;' : 'color: #2D3748; border: 1px solid #EDF2F7;',
                      highlightedMessageId === message.id ? 'box-shadow: 0 0 0 3px #FFD700 !important;' : ''
                    ]"
                    :id="'msg-' + message.id"
                  >
                    <div class="text-body-2" v-html="highlightSearchTerms(message.text)"></div>
                  </v-card>
                  <div class="d-flex align-center mt-1 px-1">
                    <span class="text-caption" style="color: #A0AEC0;">
                      {{ formatTime(message.timestamp) }}
                    </span>
                    <v-icon
                      v-if="message.isMe"
                      :icon="message.macVerified ? 'mdi-check-all' : 'mdi-check'"
                      size="14"
                      :color="message.macVerified ? '#1DA88B' : '#CBD5E0'"
                      class="ml-1"
                    ></v-icon>
                    <v-icon
                      v-if="!message.isMe && message.error"
                      icon="mdi-alert-circle"
                      size="14"
                      color="error"
                      class="ml-1"
                    ></v-icon>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <!-- Input Chat -->
          <div class="pa-4 border-top" style="background-color: white;">
            <div class="d-flex align-center bg-grey-lighten-4 rounded-pill px-4 py-2">
              
              <!-- Fitur Emoji -->
              <v-menu :close-on-content-click="false" location="top start">
                <template v-slot:activator="{ props }">
                  <v-btn v-bind="props" icon="mdi-emoticon-outline" variant="text" color="#718096" density="comfortable"></v-btn>
                </template>
                <v-card class="pa-2 rounded-xl" elevation="4">
                  <div class="emoji-grid">
                    <span v-for="e in commonEmojis" :key="e" @click="addEmoji(e)" class="emoji-item">{{ e }}</span>
                  </div>
                </v-card>
              </v-menu>

              <!-- <v-btn icon="mdi-plus" variant="text" color="#718096" density="comfortable" class="mr-2"></v-btn> -->
              
              <v-text-field
                ref="messageInput"
                v-model="newMessage"
                placeholder="Ketik pesan..."
                variant="plain"
                hide-details
                density="compact"
                @keyup.enter="sendMessage"
                :disabled="sending || !isEncrypted"
              ></v-text-field>

              <v-btn
                icon="mdi-send"
                :color="!newMessage.trim() ? '#CBD5E0' : '#1DA88B'"
                variant="flat"
                size="small"
                class="ml-2"
                :loading="sending"
                :disabled="!newMessage.trim() || sending || !isEncrypted"
                @click="sendMessage"
              ></v-btn>
            </div>
          </div>
        </template>
      </v-col>
    </v-row>

    <!-- Snackbar Error -->
    <v-snackbar v-model="showError" color="error" timeout="5000">
      {{ errorMessage }}
      <template v-slot:actions>
        <v-btn variant="text" @click="showError = false">Tutup</v-btn>
      </template>
    </v-snackbar>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { messageApi } from '../api/messages'
import { useCryptoStore } from '../store/cryptoStore'
import { useAuthStore } from '../store/authStore'
import * as crypto from '../services/crypto'
import MainLayout from '../layouts/MainLayout.vue'

const route = useRoute()
const router = useRouter()
const cryptoStore = useCryptoStore()
const authStore = useAuthStore()

// State Data
const contacts = ref([])
const search = ref('')
const selectedUserId = computed(() => route.params.userId)

// Objek kontak aktif
const activeContact = computed(() => {
  return contacts.value.find(c => String(c.id) === String(selectedUserId.value))
})

const messages = ref([])
const newMessage = ref('')
const sending = ref(false)
const isEncrypted = ref(false)
const messagesContainer = ref(null)
const messageInput = ref(null)

// Daftar Emoji Umum
const commonEmojis = ['😀', '😂', '😍', '👍', '🙏', '🔥', '😊', '🎉', '❤️', '🤔', '😎', '✨']

// State UI
const showError = ref(false)
const errorMessage = ref('')

// State Pencarian Pesan
const showMessageSearch = ref(false)
const messageSearchQuery = ref('')
const searchMatches = ref([])
const currentMatchIndex = ref(0)
const highlightedMessageId = ref(null)

// Kunci kriptografi sesi aktif
let aesKey = null
let hmacKey = null

// Filter kontak berdasarkan bilah pencarian
const filteredContacts = computed(() => {
  if (!search.value) return contacts.value
  return contacts.value.filter(c => 
    c.email.toLowerCase().includes(search.value.toLowerCase())
  )
})

onMounted(async () => {
  await loadContacts()
  // Hanya setup chat jika kunci privat tersedia
  if (selectedUserId.value && cryptoStore.isInitialized) {
    await setupChat()
  }
})

// Pantau perubahan parameter URL
watch(() => selectedUserId.value, async (newId) => {
  if (newId && cryptoStore.isInitialized) {
    await setupChat()
  } else {
    messages.value = []
    isEncrypted.value = false
  }
})

// Pantau status inisialisasi kunci
watch(() => cryptoStore.isInitialized, async (initialized) => {
  if (initialized && selectedUserId.value) {
    await setupChat()
  }
})

async function loadContacts() {
  try {
    const response = await messageApi.getContacts()
    contacts.value = (response.items || []).filter(u => u.email !== authStore.user?.email)
  } catch (err) {
    console.error('Gagal memuat kontak:', err)
  }
}

async function setupChat() {
  if (!selectedUserId.value) return
  if (!cryptoStore.isInitialized) return

  isEncrypted.value = false
  messages.value = []
  try {
    const cryptoInfo = await messageApi.getConversationCrypto(selectedUserId.value)

    const sharedSecretData = await cryptoStore.computeSharedSecret(
      cryptoInfo.publicKey,
      String(selectedUserId.value)
    )
    aesKey = sharedSecretData.aesKey
    hmacKey = sharedSecretData.hmacKey
    isEncrypted.value = true

    await loadMessages()
    scrollToBottom()
  } catch (err) {
    console.error('Gagal setup chat:', err)
    showError.value = true
    errorMessage.value = err.message || 'Gagal menyiapkan enkripsi'
  }
}

async function loadMessages() {
  try {
    const response = await messageApi.getMessages(selectedUserId.value)
    const encryptedMessages = response.items || []

    messages.value = await Promise.all(
      encryptedMessages.map(async (msg) => {
        try {
          const payload = JSON.parse(msg.payload)
          const ciphertext = crypto.base64ToArrayBuffer(payload.ciphertext)
          const iv = crypto.base64ToArrayBuffer(payload.iv)
          const decrypted = await crypto.decrypt(ciphertext, iv, aesKey)
          const text = new TextDecoder().decode(decrypted)

          let macVerified = false
          if (payload.mac && hmacKey) {
            const macBuffer = crypto.base64ToArrayBuffer(payload.mac)
            macVerified = await crypto.verify(text, macBuffer, hmacKey)
          }

          return {
            id: msg.id,
            text,
            timestamp: new Date(msg.createdAt),
            isMe: payload.sender_email === authStore.user?.email,
            macVerified
          }
        } catch {
          return {
            id: msg.id,
            text: '[Dekripsi gagal]',
            timestamp: new Date(msg.createdAt),
            isMe: false,
            macVerified: false,
            error: true
          }
        }
      })
    )
  } catch (err) {
    console.error('Gagal memuat pesan:', err)
  }
}

async function sendMessage() {
  if (!newMessage.value.trim() || sending.value || !isEncrypted.value) return

  sending.value = true
  const text = newMessage.value.trim()

  try {
    const plaintext = new TextEncoder().encode(text)
    const { ciphertext, iv } = await crypto.encrypt(plaintext, aesKey)
    const mac = await crypto.sign(text, hmacKey)

    const payload = {
      sender_email: authStore.user?.email,
      receiver_email: activeContact.value?.email,
      ciphertext: crypto.arrayBufferToBase64(ciphertext),
      iv: crypto.arrayBufferToBase64(iv),
      mac: crypto.arrayBufferToBase64(mac),
      timestamp: new Date().toISOString()
    }

    await messageApi.sendMessage(selectedUserId.value, JSON.stringify(payload))

    messages.value.push({
      id: `temp_${Date.now()}`,
      text,
      timestamp: new Date(),
      isMe: true,
      macVerified: true
    })

    newMessage.value = ''
    scrollToBottom()

    // Fokus kembali ke input
    nextTick(() => {
      messageInput.value?.focus()
    })
  } catch (err) {
    console.error('Gagal mengirim pesan:', err)
    showError.value = true
    errorMessage.value = 'Gagal mengirim pesan'
  } finally {
    sending.value = false
  }
}

function selectUser(contact) {
  router.push(`/chat/${contact.id}`)
}

function addEmoji(emoji) {
  newMessage.value += emoji
  nextTick(() => {
    messageInput.value?.focus()
  })
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

function formatTime(date) {
  if (!date) return ''
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Fungsi Pencarian Pesan
function openMessageSearch() {
  showMessageSearch.value = true
  messageSearchQuery.value = ''
  searchMatches.value = []
  currentMatchIndex.value = 0
  highlightedMessageId.value = null
}

function closeMessageSearch() {
  showMessageSearch.value = false
  messageSearchQuery.value = ''
  searchMatches.value = []
  currentMatchIndex.value = 0
  highlightedMessageId.value = null
}

// Pantau perubahan query pencarian
watch(messageSearchQuery, (query) => {
  if (!query.trim()) {
    searchMatches.value = []
    currentMatchIndex.value = 0
    highlightedMessageId.value = null
    return
  }

  // Cari semua pesan yang cocok
  const matches = []
  const lowerQuery = query.toLowerCase()

  messages.value.forEach((message, index) => {
    if (message.text.toLowerCase().includes(lowerQuery)) {
      matches.push({
        messageIndex: index,
        messageId: message.id
      })
    }
  })

  searchMatches.value = matches
  currentMatchIndex.value = matches.length > 0 ? 0 : -1

  if (matches.length > 0) {
    highlightedMessageId.value = matches[0].messageId
    scrollToMessage(matches[0].messageId)
  }
})

function nextSearchResult() {
  if (searchMatches.value.length === 0) return

  currentMatchIndex.value = (currentMatchIndex.value + 1) % searchMatches.value.length
  const match = searchMatches.value[currentMatchIndex.value]
  highlightedMessageId.value = match.messageId
  scrollToMessage(match.messageId)
}

function prevSearchResult() {
  if (searchMatches.value.length === 0) return

  currentMatchIndex.value = currentMatchIndex.value === 0
    ? searchMatches.value.length - 1
    : currentMatchIndex.value - 1
  const match = searchMatches.value[currentMatchIndex.value]
  highlightedMessageId.value = match.messageId
  scrollToMessage(match.messageId)
}

function scrollToMessage(messageId) {
  nextTick(() => {
    const element = document.getElementById(`msg-${messageId}`)
    if (element && messagesContainer.value) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}

function highlightSearchTerms(text) {
  if (!messageSearchQuery.value.trim() || !showMessageSearch.value) {
    return escapeHtml(text)
  }

  const query = messageSearchQuery.value.trim()
  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()

  if (!lowerText.includes(lowerQuery)) {
    return escapeHtml(text)
  }

  // Split text by search term and highlight
  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi')
  const highlighted = text.replace(regex, '<mark style="background-color: #FFD700; color: #000; padding: 1px 2px; border-radius: 2px;">$1</mark>')

  return highlighted
}

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
</script>

<style scoped>
.dashboard-container {
  height: calc(100vh - 120px);
}

.messages-area {
  height: 0;
}

.sidebar-border {
  border-right: 1px solid #EDF2F7;
}

.border-bottom {
  border-bottom: 1px solid #EDF2F7;
}

.border-top {
  border-top: 1px solid #EDF2F7;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 8px;
}

.emoji-item {
  font-size: 1.5rem;
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  transition: background 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
}

.emoji-item:hover {
  background-color: #F7F9FC;
}

.search-field :deep(.v-field__outline) {
  --v-field-border-width: 1px !important;
  color: #E2E8F0 !important;
}

/* Penataan scrollbar */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #E2E8F0;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #CBD5E0;
}
</style>
