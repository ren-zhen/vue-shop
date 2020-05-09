<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <el-button type='primary' @click='showCateDialog'>添加分类</el-button>
      <!-- 表格 -->
      <tree-table :data='cateList' :columns='columns' :selection-type='false' :expand-type='false' show-index border>
        <template slot='isOk' slot-scope='scope'>
          <i class="el-icon-success" v-if='scope.row.cat_deleted="false"' style="color: lightgreen;"></i>
          <i class="el-icon-error" v-else style="color: red;"></i>
        </template>
        <!-- 等级列 -->
        <template  slot='catLevel' slot-scope='scope'>
          <el-tag v-if='scope.row.cat_level == "0"'>一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level == '1'">二级</el-tag>
          <el-tag type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作列 -->
        <template  slot='Operation' slot-scope='scope'>
          <el-button type="primary" icon="el-icon-edit" @click="ShowEditDialog(scope.row.cat_id)">编辑</el-button>
          <!-- 删除按钮 -->
          <el-button type="danger" icon="el-icon-delete" @click="RemoveCateById(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="40%" @close="addCateDialogClosed">
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:">
          <!-- options用来绑定数据源 -->
          <el-cascader v-model="selectedKeys" :options="parentCateList" :props="cascaderProps" @change="parentCateChange" clearable ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑分类对话框 -->
    <el-dialog title="修改分类" :visible.sync="editCateDialogVisible" width="40%" @close='editCateDialogClosed'>
      <el-form :model="editCateForm" :rules="editCateFormRules" ref="editCateFormRef" label-width="100px">
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
    </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类的数据列表，默认为空
      cateList: [],
      // 总的数据条数
      total: 0,
      // 为table指定列的
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用模板的名称
          template: 'isOk'
        },
        {
          label: '排序',
          prop: 'cat_level',
          type: 'template',
          template: 'catLevel'
        },
        {
          label: '操作',
          type: 'template',
          template: 'Operation'
        }
      ],
      // 控制添加分类对话框的显示和隐藏
      addCateDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 父级分类ID
        cat_pid: 0,
        // 将要添加的分类名称
        cat_name: '',
        // 默认的要添加的分类级别为一级分类
        cat_level: 0
      },
      // 添加分类的表单验证对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入活动名称', trigger: 'blur' }
        ]
      },
      // 获取的父级分类数据
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        checkStrictly: true,
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的父级分类
      selectedKeys: [],
      // 控制编辑对话框的显示和隐藏
      editCateDialogVisible: false,
      // 编辑分类的表单数据对象
      editCateForm: {},
      // 编辑分类表单的验证规则对象
      editCateFormRules: {
        cat_name: [
          { required: true, message: '请输入活动名称', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      var { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      // console.log(res)
      if (res.meta.status !== 200) {
        this.$message.error('获取商品分类失败！')
      }
      this.cateList = res.data.result
      this.total = res.data.total
      // console.log(this.cateList)
    },
    // 监听 pagesize 的改变事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听 pagenum 改变的事h件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 监听 添加分类按钮的点击事件
    showCateDialog() {
      this.getParentCate()
      this.addCateDialogVisible = true
    },
    // 获取父级分类列表数据
    async getParentCate() {
      var { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      // console.log(res.data)
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类失败！')
      }
      this.parentCateList = res.data
    },
    // 父级分类发生改变时触发的事件
    parentCateChange() {
      // console.log(this.selectedKeys)
      // this.selectedKeys
      // 如果selectedKeys数组的length长度大于 0，说明有选中父级分类，反之，没有选中父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的ID
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 为当前新增的分类赋等级
        this.addCateForm.cat_level = this.selectedKeys.length
        // return
      } else {
        // 父级分类的ID
        this.addCateForm.cat_pid = 0
        // 当前分类的等级
        this.addCateForm.cat_level = 0
      }
    },
    // 点击按钮，添加新的商品分类，发起网络请求
    async addCate() {
      // console.log(this.addCateForm)
      var { data: res } = await this.$http.post('categories', this.addCateForm)
      if (res.meta.status !== 201) {
        return this.$message.error('添加分类失败！')
      }
      this.$message.success('添加分类成功！')
      this.getCateList()
      this.addCateDialogVisible = false
      // console.log(res.data)
    },
    // 监听分类对话框的关闭事件，重置表单
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      // 父级分类重置
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    // 点击编辑分类按钮,显示对话框，发起网络请求
    async ShowEditDialog(id) {
      var { data: res } = await this.$http.get('categories/' + id)
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$http.$message.error('获取分类失败！')
      }
      this.editCateForm = res.data
      this.editCateDialogVisible = true
    },
    // 监听编辑分类对话框关闭事件，重置表单
    editCateDialogClosed() {
      this.$refs.editCateFormRef.resetFields()
    },
    // 编辑分类提交事件
    editCate() {
      // 点击确认时校验表单
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('修改失败！')
        }
        var { data: res } = await this.$http.put('categories/' + this.editCateForm.cat_id, { cat_name: this.editCateForm.cat_name })
        // console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('修改失败！')
        }
        this.getCateList()
        this.$message.success('更新成功！')
        this.editCateDialogVisible = false
      })
    },
    // 删除分类
    async RemoveCateById(id) {
      var confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除操作')
      }
      // 确认删除角色发起网络请求
      var { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色失败！')
      }
      this.$message.success('删除角色成功！')
      this.getCateList()
    }
  }
}
</script>

<style lang="less" scoped="scoped">
  .el-button {
    margin-bottom: 15px;
  }
  .el-pagination {
    margin-top: 15px;
  }
  .el-cascader {
    width:100%
  }
</style>
