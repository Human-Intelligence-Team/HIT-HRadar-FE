<script setup>
const emit = defineEmits(['close'])

const isModalOpen = () => {
  emit('close')
}

const tagDelete = (tagId) => {

  let tagTotalCount = 10;
  if (tagTotalCount > 0) {
    alert("사용중인 개수가 1개 이상이라 삭제할 수 없습니다.");
    console.log(tagId);
  } else {
    alert("정말 삭제하시겠습니까?");
  }
}

const tagAdd = () => {
  alert("등록하시겠습니까?");
}

</script>

<template>
  <div class="overlay">
    <div class="modal">
      <div class="modal-head">
        <div class="modal-title">
          태그 관리
        </div>
        <button class="btn ghost" @click="isModalOpen">닫기</button>
      </div>

      <div class="modal-add">
        <span><strong>* 태그 등록</strong></span>
        <div class="add-box">
          <div class="search-section">
            <div class="label">태그 명</div>
            <input class="input"/>
          </div>

          <div class="search-btn">
            <button class="btn primary search" @click="tagAdd()">등록</button>
          </div>
        </div>

      </div>

      <div class="modal-hr"></div>

      <span><strong>* 태그 조회</strong></span>
      <div class="modal-search">
        <div class="search-section">
          <div class="label">태그 명</div>
          <input class="input"/>
        </div>

        <div class="search-btn">
          <button class="btn reset">초기화</button>
          <button class="btn primary search">검색</button>
        </div>
      </div>

      <div class="modal-body">
        <table class="table">
          <thead class="tbl-hd">
          <tr>
            <th style="width:40%;">태그명</th>
            <th style="width:40%;">사용 개수</th>
            <th style="width:20%;"></th>
          </tr>
          </thead>
          <tbody class="tbl-bd">
          <tr>
            <td >영업</td>
            <td>20</td>
            <td>
              <button class="btn"
                        type="button"
              >삭제
              </button>
            </td>
          </tr>
          <tr>
            <td >영업</td>
            <td>20</td>
            <td>
              <button class="btn"
                      type="button"
                      @click="tagDelete(1)"
              >삭제
              </button>
            </td>
          </tr>
          <tr>
            <td >영업</td>
            <td>20</td>
            <td>
              <button class="btn"
                      type="button"
              >삭제
              </button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

</template>

<style scoped>
@import "@/assets/styles/searchBox.css";
.modal-search {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  margin: 20px;

  border: 1px solid var(--border);   /* 테두리 */
  border-radius: 12px;               /* 라운드 */
  background: rgba(255, 255, 255, 0.03); /* 살짝 배경 */
}

.modal-body .table td {
  vertical-align: middle;
}

.modal-add {
  padding-top: 25px;
}

.modal-add .add-box {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  margin: 20px;


  border: 1px solid var(--border);   /* 테두리 */
  border-radius: 12px;               /* 라운드 */
}

.modal-hr {
  border: 1px solid var(--border);
  margin: 20px;
}

 span {
  font-weight: bold;
  padding-left: 30px;
}

.tbl-hd th,
.tbl-bd td {
  text-align: center;
  vertical-align: middle;
}
</style>
