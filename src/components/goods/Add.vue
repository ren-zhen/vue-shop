<template>
  <div>
    <!-- 面包屑导航部分 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 提示信息 -->
       <el-alert title="添加商品信息" type="info" center show-icon :closable= 'false'></el-alert>
       <!-- 步骤条 -->
       <el-steps :active="activeIndex - 0" finish-status="success" align-center>
         <el-step title="基本信息"></el-step>
         <el-step title="商品参数"></el-step>
         <el-step title="商品属性"></el-step>
         <el-step title="商品图片"></el-step>
         <el-step title="商品内容"></el-step>
         <el-step title="完成"></el-step>
       </el-steps>
       <!-- tab 栏切换 -->
       <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position='top'>
        <el-tabs v-model ='activeIndex' :tab-position="'left'" :before-leave='beforeTabLeave' @tab-click='tabClicked'>
           <el-tab-pane label="基本信息" name='0'>
             <el-form-item label="商品名称" prop="goods_name">
               <el-input v-model="addForm.goods_name"></el-input>
             </el-form-item>
             <el-form-item label="商品价格" prop="goods_price">
               <el-input v-model="addForm.goods_price" type='number'></el-input>
             </el-form-item>
             <el-form-item label="商品重量" prop="goods_weight">
               <el-input v-model="addForm.goods_weight" type='number'></el-input>
             </el-form-item>
             <el-form-item label="商品数量" prop="goods_number">
               <el-input v-model="addForm.goods_number" type='number'></el-input>
             </el-form-item>
             <el-form-item label="商品分类" prop="goods_cat">
               <el-cascader
                   v-model="addForm.goods_cat"
                   :options="catList"
                   :props="catProps"
                   @change="handleChange"></el-cascader>
             </el-form-item>
           </el-tab-pane>
           <el-tab-pane label="商品参数" name='1'>
             <el-form-item :label="item.attr_name" v-for='item in manyTabDate' :key='item.attr_id'>
               <el-checkbox-group v-model="item.attr_vals">
                 <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key='i' border></el-checkbox>
               </el-checkbox-group>
             </el-form-item>
           </el-tab-pane>
           <el-tab-pane label="商品属性" name='2'>
             <el-form-item :label="item.attr_name" v-for='item in onlyTabDate' :key='item.attr_id'>
               <el-input v-model='item.attr_vals'></el-input>
             </el-form-item>
           </el-tab-pane>
           <el-tab-pane label="商品图片" name='3'>
             <el-upload
               :action="uploadURL"
               :on-preview="handlePreview"
               :on-remove="handleRemove"
               list-type="picture" :headers='headersObj' :on-success='handleSuccess'>
               <el-button size="small" type="primary">点击上传</el-button>
             </el-upload>
           </el-tab-pane>
           <el-tab-pane label="商品内容" name='4'>
             <quill-editor v-model='addForm.goods_introduce'></quill-editor>
             <el-button type='primary' @click='add'>添加商品</el-button>
           </el-tab-pane>
         </el-tabs>
       </el-form>
    </el-card>
    <!-- 图片预览对话框 -->
    <el-dialog
      title="图片预览"
      :visible.sync="previewDialogVisible"
      width="40%">
      <img :src="previewPath" alt="" class="previewimg">
    </el-dialog>
  </div>
</template>

<script>
// 导入lodash
import _ from 'lodash'
export default {
  data() {
    return {
      activeIndex: '0',
      // 添加商品的表单对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: '',
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      // 表单的验证规则对象
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请输入商品分类', trigger: 'blur' }
        ]
      },
      // 商品分类列表
      catList: [],
      // 级联选择器的属性
      catProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 商品参数
      manyTabDate: [],
      // 商品属性
      onlyTabDate: [],
      // 图片上传的URL地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传组件的请求头对象
      headersObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 图片预览的路径
      previewPath: '',
      // 控制图片预览对话框的显示
      previewDialogVisible: false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类
    async getCateList() {
      var { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类列表失败！')
      }
      this.catList = res.data
    },
    // 级联选择器发生变化，会触发这个函数
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    // tab 栏切换的条件
    beforeTabLeave(activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先完成商品分类的选择！')
        return false
      }
    },
    // tab 栏点击切换事件
    async tabClicked() {
      // console.log(this.activeIndex)
      // 判断的是否访问是动态参数面板
      if (this.activeIndex === '1') {
        var { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
        console.log(res)
        if (res.meta.status !== 200) {
          this.$message.error('获取参数失败！')
        }
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTabDate = res.data
      }
      // 判断是否访问的是属性面板
      if (this.activeIndex === '2') {
        var { data: resp } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
        console.log(resp)
        if (resp.meta.status !== 200) {
          this.$message.error('获取参数失败！')
        }
        this.onlyTabDate = resp.data
      }
    },
    // 处理图片预览效果
    handlePreview(file) {
      this.previewPath = file.response.data.url
      this.previewDialogVisible = true
    },
    // 处理移除图片的操作
    handleRemove(file) {
      // 1.获取图片的存放路径
      var filePath = file.response.data.tmp_path
      // 2.从pics数组中，找到图片对应的索引值
      var i = this.addForm.pics.findIndex(x => x.pic === filePath)
      // 3.调用数组 splice方法，把图片信息对象，从 pics 中移除
      this.addForm.pics.splice(i, 1)
    },
    // 图片上传成功后的操作
    handleSuccess(response) {
      var picInfo = { pic: response.data.tmp_path }
      this.addForm.pics.push(picInfo)
      console.log(this.addForm)
    },
    // 添加商品
    add() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项')
        }
        // 对addform进行深拷贝
        var form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数
        this.manyTabDate.forEach(item => {
          var newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals }
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态参数
        this.onlyTabDate.forEach(item => {
          var newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        console.log(form)
        // 发起请求，添加商品
        var { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败！')
        }
        this.$message.success('添加商品成功！')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    cateId() {
      // 获取级联菜单是否获取了第三级的数据
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped="scoped">
.previewimg {
  width: 100%;
}
.el-button {
  margin-top: 15px;
}
</style>
