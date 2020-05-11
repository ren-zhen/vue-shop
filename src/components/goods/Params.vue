<template>
  <div>
   <!-- 面包屑导航 -->
   <el-breadcrumb separator-class="el-icon-arrow-right">
     <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
     <el-breadcrumb-item>商品管理</el-breadcrumb-item>
     <el-breadcrumb-item>参数列表</el-breadcrumb-item>
   </el-breadcrumb>
   <!-- 卡片视图区域 -->
   <el-card class="box-card">
     <!-- 头部的警告取 -->
      <el-alert title="注意:只允许为第三级分类设置相关的参数!" type="warning" :closable="false" show-icon></el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class='cate-opt'>
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader
              v-model="selectedCateKeys"
              :options="cateList"
              :props="cateProps"
              @change="handleChange"></el-cascader>
        </el-col>
      </el-row>
      <!-- tab标签页区域 -->
       <el-tabs v-model="activeName" @tab-click="handleTabClick">
         <!-- 动态参数的控制面板 -->
          <el-tab-pane label="动态参数" name="many">
             <el-button type="primary" size='mini' :disabled='isBtnDisabled' @click='showAddDialog'>添加参数</el-button>
             <!-- 动态参数表格 -->
              <el-table :data="manyTableList" border stripe>
                <!-- 展开行 -->
                <el-table-column type="expand" width="50px">
                  <template slot-scope='scope'>
                    <el-tag v-for='(item,index) in scope.row.attr_vals' :key='index' closable @close='closedAttrVals(index,scope.row)'>{{item}}</el-tag>
                    <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small"
                      @keyup.enter.native="handleInputConfirm(scope.row)"
                      @blur="handleInputConfirm(scope.row)">
                    </el-input>
                    <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                  </template>
                </el-table-column>
                <el-table-column type="index" width="50px"></el-table-column>
                   <el-table-column prop="attr_name" label="参数名称"></el-table-column>
                   <el-table-column label="操作">
                     <template slot-scope='scope'>
                       <el-button  size='mini' type="primary" icon="el-icon-edit" @click='showEditDialog(scope.row.attr_id)'>编辑</el-button>
                       <el-button size='mini' type="danger" icon="el-icon-delete" @click='deleteParam(scope.row.attr_id)'>删除</el-button>
                     </template>
                   </el-table-column>
                 </el-table>
          </el-tab-pane>
          <!-- 静态属性的控制面板 -->
          <el-tab-pane label="静态属性" name="only">
             <el-button type="primary" size='mini' :disabled='isBtnDisabled' @click='showAddDialog'>添加属性</el-button>
             <!-- 静态属性表格 -->
             <el-table :data="onlyTableList" border stripe>
               <el-table-column type="expand" width="50px">
                 <template slot-scope='scope'>
                   <el-tag v-for='(item,index) in scope.row.attr_vals' :key='index' closable @close='closedAttrVals(index,scope.row)'>{{item}}</el-tag>
                   <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small"
                     @keyup.enter.native="handleInputConfirm(scope.row)"
                     @blur="handleInputConfirm(scope.row)">
                   </el-input>
                   <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                 </template>
               </el-table-column>
               <el-table-column type="index" width="50px"></el-table-column>
                  <el-table-column prop="attr_name" label="属性名称"></el-table-column>
                  <el-table-column label="操作">
                    <template slot-scope='scope'>
                      <el-button size='mini' type="primary" icon="el-icon-edit" @click='showEditDialog(scope.row.attr_id)'>编辑</el-button>
                      <el-button size='mini' type="danger" icon="el-icon-delete" @click='deleteParam(scope.row.attr_id)'>删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
          </el-tab-pane>
        </el-tabs>
   </el-card>
   <!-- 添加参数对话框 -->
   <el-dialog :title="'添加' + titleText" :visible.sync="addDialogVisible" width="40%" @close='addDialogClosed'>
     <el-form :model="addParamForm" :rules="addParamFormRules" ref="addParamFormRef" label-width="100px">
       <el-form-item :label="titleText" prop="attr_name">
         <el-input v-model="addParamForm.attr_name"></el-input>
       </el-form-item>
     </el-form>
     <span slot="footer" class="dialog-footer">
       <el-button @click="addDialogVisible = false">取 消</el-button>
       <el-button type="primary" @click="addDialog">确 定</el-button>
     </span>
   </el-dialog>
   <!-- 编辑参数对话框 -->
   <el-dialog :title="'添加' + titleText" :visible.sync="editDialogVisible" width="40%" @close='editDialogClosed'>
     <el-form :model="editParamForm" :rules="editParamFormRules" ref="editParamFormRef" label-width="100px">
       <el-form-item :label="titleText" prop="attr_name">
         <el-input v-model="editParamForm.attr_name"></el-input>
       </el-form-item>
     </el-form>
     <span slot="footer" class="dialog-footer">
       <el-button @click="editDialogVisible = false">取 消</el-button>
       <el-button type="primary" @click="editDialog">确 定</el-button>
     </span>
   </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 商品分类的数据列表
      cateList: [],
      // 级联选择框的设置属性的对象
      cateProps: {
        expandTrigger: 'hover',
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      // 级联选择器双向绑定选中的分类数组
      selectedCateKeys: [],
      // tab 标签页的选中状态
      activeName: 'many',
      // 获取的动态参数数据
      manyTableList: [],
      // 获取的静态参数数据
      onlyTableList: [],
      // 控制添加参数对话框的显示和隐藏
      addDialogVisible: false,
      // 添加参数的表单数据对象
      addParamForm: {
        attr_name: ''
      },
      // 添加参数的表单验证规则对象
      addParamFormRules: {
        attr_name: [
          { required: true, message: '请输入参数', trigger: 'blur' }
        ]
      },
      // 控制编辑参数对话框的显示和隐藏
      editDialogVisible: false,
      // 修改表单的数据对象
      editParamForm: {},
      // 编辑参数表单的验证规则对象
      editParamFormRules: {
        attr_name: [
          { required: true, message: '请输入参数', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      var { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        this.$message.error('获取商品分类数据失败！')
      }
      this.cateList = res.data
    },
    // 级联选择项选择变化会触发的事件
    handleChange () {
      this.getParams()
    },
    // tab 标签页点击事件的处理函数
    handleTabClick () {
      this.getParams()
    },
    // 获取参数的调用函数
    async getParams () {
      // 选中的不是三级分类
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableList = []
        this.onlyTableList = []
      }
      // 根据所选的分类ID,和当前所处的面板，获取对应的参数
      var { data: res } = await this.$http.get(`categories/${this.selectedId}/attributes`, { params: { sel: this.activeName } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败！')
      }
      // 参数中的值进行遍历，成一个数组
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        item.inputVisible = false
        item.inputValue = ''
      })
      console.log(res.data)
      // 判断获取的参数
      if (this.activeName === 'many') {
        this.manyTableList = res.data
      } else {
        this.onlyTableList = res.data
      }
    },
    // 点击按钮显示添加参数对话框
    showAddDialog() {
      this.addDialogVisible = true
    },
    // 监听对话框的关闭事件，重置表单
    addDialogClosed() {
      this.$refs.addParamFormRef.resetFields()
    },
    // 添加参数
    addDialog() {
      this.$refs.addParamFormRef.validate(async valid => {
        // console.log(valid)
        if (!valid) return
        var { data: res } = await this.$http.post(`categories/${this.selectedId}/attributes`, { attr_name: this.addParamForm.attr_name, attr_sel: this.activeName })
        // console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败！')
        }
        this.$message.success('添加参数成功！')
        this.getParams()
        this.addDialogVisible = false
      })
    },
    // 显示编辑对话框
    async showEditDialog(id) {
      this.editDialogVisible = true
      // 查询当前参数的信息
      var { data: res } = await this.$http.get(`categories/${this.selectedId}/attributes/${id}`, { params: { attr_sel: this.activeName } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取数据失败！')
      }
      this.editParamForm = res.data
    },
    // 监听编辑关闭对话框,重置表单事件
    editDialogClosed() {
      this.$refs.editParamFormRef.resetFields()
    },
    // 确认提交编辑参数
    editDialog() {
      this.$refs.editParamFormRef.validate(async valid => {
        if (!valid) return
        var { data: res } = await this.$http.put(`categories/${this.selectedId}/attributes/${this.editParamForm.attr_id}`, { attr_name: this.editParamForm.attr_name, attr_sel: this.activeName })
        if (res.meta.status !== 200) {
          return this.$message.error('更新参数失败！')
        }
        this.$message.success('更新参数成功！')
        this.getParams()
        this.editDialogVisible = false
      })
    },
    // 删除参数事件
    async deleteParam(id) {
      var confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 用户取消删除操作
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除操作')
      }
      var { data: res } = await this.$http.delete(`categories/${this.selectedId}/attributes/${id}`)
      if (res.meta.status !== 200) {
        this.$message.error('删除参数失败！')
      }
      this.$message.success('删除参数成功！')
      this.getParams()
    },
    // 添加 tag 标签的事件,文本框失去焦点 或 触发enter
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
      }
      // 做后续的处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      // 发起网络请求，保存这次操作
      this.saveAttrVals(row)
    },
    // 点击按钮，显示文本输入框
    showInput(row) {
      row.inputVisible = true
      // $nextTick 方法的作用：当页面上元素被重新喧染之后，才会指定回调函数中的代码
      this.$nextTick(_ => {
        // 让文本框自动获取焦点
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 对attr_vals的操作保存到数据库中
    async saveAttrVals(row) {
      // 发起网络请求，保存这次操作
      var { data: res } = await this.$http.put(`categories/${this.selectedId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) {
        this.$message.error('修改参数项失败！')
      }
      this.$message.success('修改参数项成功！')
    },
    // 删除参数项tag标签
    closedAttrVals(i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    }
  },
  computed: {
    // 判断按钮是否禁用
    isBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        // 禁用
        return true
      }
      return false
    },
    // 获取选中的三级分类的ID
    selectedId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    // 控制添加参数对话框 标题 的显示
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>

<style lang="less" scoped="scoped">
  .cate-opt {
    margin: 15px 0;
  }
  .el-tag {
    margin-right: 15px;
  }
  .input-new-tag {
    width:120px
  }
</style>
