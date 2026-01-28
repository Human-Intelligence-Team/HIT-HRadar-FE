<script setup>
import { useRouter } from 'vue-router'
import TagModalView from '@/views/contents/tag/TagModalView.vue'
import { ref } from 'vue'

const isTagModalOpen = ref(false);
const router = useRouter();
const goCreatePage = () => {
  router.push({ path:'/all/contents/create'});
}

const goDetailPage = (contentId) => {
  router.push(`/all/contents/detail/${contentId}`);
}

const isModalOpen = () => {
  isTagModalOpen.value = !isTagModalOpen.value;
}

</script>

<template>
  <div class="sub">학습컨텐츠 조회</div>

  <div class="grid">
    <div class="card">
      <div class="card-head">
        <div class="search-section">
          <span class="label">컨텐츠 명</span>
          <input class="input"/>
        </div>

        <div class="search-section">
          <div class="label">유형</div>
          <select class="select">
            <option value="">전체</option>
          </select>
        </div>

        <div class="search-section">
          <div class="label">난이도</div>
          <select class="select">
            <option value="">전체</option>
          </select>
        </div>

        <div class="search-btn">
          <button class="btn reset">초기화</button>
          <button class="btn primary search">검색</button>
        </div>

      </div>
      <div class="card-head">
        <div class="search-section">
          <div class="label">학습시간</div>
          <select class="select">
            <option value="">전체</option>
          </select>
        </div>

        <div class="search-section">
          <div class="label">태그</div>
          <input class="input" type="text"/>
        </div>

        <div class="search-section">
          <div class="label">사용여부</div>
          <select class="select">
            <option value="">전체</option>
          </select>
        </div>

      </div>
    </div>
  </div>

  <div class="grid">
      <div class="card">

        <div class="section-tag">
          <button class="btn primary" type="button" @click="isModalOpen">태그 관리</button>
        </div>

        <div class="card-bd">
        <table class="table">
          <thead class="tbl-hd">
          <tr>
            <th style="width:30%;">콘텐츠 명</th>
            <th style="width:10%;">유형</th>
            <th style ="width:10%;">난이도</th>
            <th style="width:10%;">학습시간</th>
            <th style="width:30%;">태그</th>
            <th style="width:10%;">사용여부</th>
          </tr>
          </thead>
          <tbody class="tbl-bd">
          <tr @click="goDetailPage(1)">
            <td >영업을 위한 학습 컨텐츠</td>
            <td>도서</td>
            <td>하</td>
            <td>3시간</td>
            <td>#영업, #신입 </td>
            <td>Y</td>
          </tr>
          <tr @click="goDetailPage(1)">
            <td>영업을 위한 학습 컨텐츠</td>
            <td>도서</td>
            <td>하</td>
            <td>3시간</td>
            <td>#영업, #신입 </td>
            <td>Y</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <div class="section-btn">
    <button class="btn primary" @click="goCreatePage()" type="button">등록</button>
  </div>

  <TagModalView
    v-if="isTagModalOpen"
    @close="isModalOpen"
  />
</template>

<style scoped>
@import "@/assets/styles/searchBox.css";

.section-btn {
  display: flex;
  justify-content: flex-end;
  padding: 10px;
}

.section-tag {
  display: flex;
  justify-content: flex-end;
  padding: 15px;

}

</style>
