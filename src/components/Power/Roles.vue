<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <!-- 添加角色按钮 -->
       <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
       <!-- 角色列表区域 -->
       <el-table :data="rolesForm" style="width: 100%" border stripe>
           <!-- 展开列 -->
           <el-table-column type="expand">
             <template slot-scope="scope">
               <el-row :class="['linebottom',index1 === 0 ? 'linetop' : '', 'vcenter']" v-for='(item1,index1) in scope.row.children' :key='item1.id'>
                 <!-- 喧染一级权限 -->
                 <el-col :span='5'>
                   <el-tag closable  @close='removeRightsById(scope.row, item1.id)'>{{item1.authName}}</el-tag>
                   <i class="el-icon-caret-right"></i>
                 </el-col>
                 <!-- 喧染二级权限和三级权限 -->
                 <el-col :span='19'>
                   <!-- 通过 for 循环 嵌套渲染二级菜单 -->
                   <el-row :class="[index2 === 0 ? '' : 'linetop', 'vcenter']" v-for='(item2, index2) in item1.children' :key='item2.id'>
                     <!-- 渲染二级菜单 -->
                    <el-col :span='6'>
                      <el-tag closable  @close='removeRightsById(scope.row, item2.id)' type='success'>{{item2.authName}}</el-tag>
                      <i class="el-icon-caret-right"></i>
                    </el-col>
                    <!--  渲染三级菜单  -->
                    <el-col :span='18'>
                        <el-tag  closable  @close='removeRightsById(scope.row, item3.id)' type='warning' v-for='item3 in item2.children' :key='item3.id'>{{item3.authName}}</el-tag>
                    </el-col>
                   </el-row>
                 </el-col>
               </el-row>
               <!-- <pre>
                 {{scope.row}}
               </pre> -->
             </template>
           </el-table-column>
           <!-- 索引列 -->
           <el-table-column type="index" width="50"></el-table-column>
           <el-table-column label="角色名称" prop="roleName"></el-table-column>
           <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
           <el-table-column label="操作">
             <template slot-scope="scope">
               <!-- 编辑按钮 -->
               <el-button type="primary" icon="el-icon-edit" @click="ShowEditDialog(scope.row.id)">编辑</el-button>
               <!-- 删除按钮 -->
               <el-button type="danger" icon="el-icon-delete" @click="RemoveRoleById(scope.row.id)">删除</el-button>
               <!-- 分配权限按钮 -->
               <el-button type="warning" icon="el-icon-setting" @click='showRightsDialog(scope.row)'>分配权限</el-button>
             </template>
           </el-table-column>
         </el-table>
    </el-card>
    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="40%" @close="addDialogClosed">
      <el-form :model="addRolesForm" :rules="addRolesFormRules" ref="addRolesFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色对话框 -->
    <el-dialog title="修改角色信息" :visible.sync="editDialogVisible" width="40%" @close="editDialogClosed">
      <el-form :model="editRolesForm" :rules="editRolesFormRules" ref="editRolesFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightsDialogVisible" width="40%" @close='setRightsDialogClosed'>
      <!-- 权限树形控件 -->
      <el-tree :data="rightsList" :props="treeProps" ref='treeRef' show-checkbox node-key='id' default-expand-all :default-checked-keys='defRights'></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 角色列表
      rolesForm: [],
      // 控制添加角色对话框的显示和隐藏
      addDialogVisible: false,
      // 添加用户的表单数据
      addRolesForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加角色验证规则
      addRolesFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ]
      },
      // 控制角色修改对话框的显示和隐藏
      editDialogVisible: false,
      // 查询到的角色信息
      editRolesForm: {},
      // 修改角色信息的校验规则
      editRolesFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2到 10 个字符', trigger: 'blur' }
        ]
      },
      // 控制分配权限对话框的显示和隐藏
      setRightsDialogVisible: false,
      // 存放所有的权限数据
      rightsList: [],
      // 权限树的对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点ID值
      defRights: [],
      // 当前分配角色的id
      roleId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 获取角色列表
    async getRolesList() {
      var { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
      }
      this.rolesForm = res.data
      // console.log(this.rolesForm)
    },
    // 监听关闭添加角色对话框事件
    addDialogClosed() {
      this.$refs.addRolesFormRef.resetFields()
    },
    // 添加角色
    async addRoles() {
      var { data: res } = await this.$http.post('roles', this.addRolesForm)
      if (res.meta.status !== 201) {
        return this.$message.error('添加角色失败！')
      }
      this.$message.success('添加角色成功！')
      // 添加成功关闭对话框
      this.addDialogVisible = false
      // 重新喧染角色列表
      this.getRolesList()
    },
    // 点击修改按钮，显示角色信息对话框
    async ShowEditDialog(id) {
      this.editDialogVisible = true
      // console.log(id)
      var { data: res } = await this.$http.get('roles/' + id)
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败！')
      }
      this.editRolesForm = res.data
    },
    // 关闭修改角色对话框时的重置事件
    editDialogClosed() {
      this.$refs.editRolesFormRef.resetFields()
    },
    // 修改后的角色信息进行提交，发起网络请求
    editRoles() {
      this.$refs.editRolesFormRef.validate(async valid => {
        console.log(valid)
        if (!valid) {
          return this.$message.error('更新角色信息失败！')
        }
        // 发起网络请求
        var { data: res } = await this.$http.put('roles/' + this.editRolesForm.roleId,
          { roleName: this.editRolesForm.roleName, roleDesc: this.editRolesForm.roleDesc })
        if (res.meta.status !== 200) {
          return this.$message.error('更新角色信息失败！')
        }
        // 修改成功,关闭对话框，重新喧染页面
        this.editDialogVisible = false
        this.getRolesList()
      })
    },
    // 删除角色
    async RemoveRoleById(id) {
      // console.log(id)
      var confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除操作')
      }
      // 确认删除角色发起网络请求
      var { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色失败！')
      }
      this.$message.success('删除角色成功！')
      this.getRolesList()
    },
    // 展开列中的三级菜单的删除提示框
    async removeRightsById(role, rightsId) {
      var confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除操作')
      }
      // 确认删除权限，发送网络请求
      var { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightsId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色权限失败！')
      }
      role.children = res.data
      this.$message.success('删除角色权限成功！')
    },
    // 点击分配权限按钮，显示分配权限对话框和加载权限
    async showRightsDialog(role) {
      this.roleId = role.id
      // 获取所有的权限
      var { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败！')
      }
      this.rightsList = res.data
      // console.log(this.rightsList)
      // 通过递归获取三级节点的ID
      this.getLeafRights(role, this.defRights)
      // 显示分配权限对话框
      this.setRightsDialogVisible = true
    },
    // 通过递归的形式，获取角色下所有的三级权限的id，并保存到defRights数组中
    getLeafRights(node, arr) {
      // 如果当前 node 节点不包含 children 属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafRights(item, arr))
    },
    // 监听分配权限对话框的关闭事件
    setRightsDialogClosed() {
      this.defRights = []
    },
    // 点击分配权限的确认按钮，为角色分配权限
    async setRights() {
      // 通过引用树形控件的方法得到选中的权限数组
      var arr = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
      var idStr = arr.join(',')
      // 发起网络请求，对角色授权
      var { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('角色授权失败！')
      }
      this.$message.success('角色授权成功！')
      this.getRolesList()
      this.setRightsDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped="scoped">
  .el-tag {
    margin: 15px;
  }
  .linetop {
    border-top: 1px solid #eee;
  }
  .linebottom {
    border-bottom: 1px solid #eee;
  }
  .vcenter {
    display: flex;
    align-items: center;
  }
</style>
