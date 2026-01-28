import { defineStore } from 'pinia'
import * as noticeApi from '@/api/noticeApi'

export const useNoticeStore = defineStore('notice', {
  state: () => ({
    data: null, // { items: [], page: {} }
    categories: [],
    searchCond: {
      keyword: '',
      categoryId: '',
      sortKey: 'CREATED_AT',
      sortDir: 'DESC'
    },
    currentNotice: null,
    loading: false
  }),

  actions: {
    async fetchCategories() {
      try {
        const response = await noticeApi.fetchNoticeCategories()
        // Assuming the response structure is { data: { items: [...] } } or similar
        // Adjust if the actual structure is different. Let's assume it's response.data.data
        this.categories = response.data.data
      } catch (error) {
        console.error('Failed to fetch notice categories:', error)
        // Handle error appropriately
      }
    },

    async searchNotices(page = 1) {
      this.loading = true
      
      const params = {
        'page.page': page,
        'page.size': 10,
        'cond.sortKey': this.searchCond.sortKey,
        'cond.sortDir': this.searchCond.sortDir,
      }

      if (this.searchCond.keyword) {
        params['cond.keyword'] = this.searchCond.keyword
      }
      if (this.searchCond.categoryId) {
        params['cond.categoryId'] = this.searchCond.categoryId
      }

      try {
        const response = await noticeApi.searchNotices(params)
        this.data = response.data.data
      } finally {
        this.loading = false
      }
    },

    setSearchCond(cond) {
      this.searchCond = { ...this.searchCond, ...cond }
      this.searchNotices()
    },

    async fetchNoticeDetail(id) {
      this.loading = true
      try {
        this.currentNotice = await noticeApi.fetchNoticeDetail(id)
      } finally {
        this.loading = false
      }
    },

    async createNotice(notice, files) {
      this.loading = true
      try {
        await noticeApi.createNotice(notice, files)
        await this.searchNotices()
      } finally {
        this.loading = false
      }
    },

    async updateNotice(id, notice) {
      this.loading = true
      try {
        this.currentNotice = await noticeApi.updateNotice(id, notice)
        await this.searchNotices()
      } finally {
        this.loading = false
      }
    },

    async deleteNotice(id) {
      this.loading = true
      try {
        await noticeApi.deleteNotice(id)
        this.currentNotice = null
        await this.searchNotices()
      } finally {
        this.loading = false
      }
    },

    async uploadImage(file) {
      return await noticeApi.uploadImage(file)
    },



    async deleteImage(imageUrl) {
      await noticeApi.deleteImage(imageUrl)
    }
  }
})