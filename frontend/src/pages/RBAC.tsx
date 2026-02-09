import { useState, useEffect } from 'react';
import { Shield, Users, Key, Plus, Trash2, Edit2, CheckCircle } from 'lucide-react';
import { api } from '../lib/api';
import './RBAC.css';

interface Permission {
  id: string;
  resource: string;
  action: string;
  description?: string;
  _count?: {
    roles: number;
  };
}

interface Role {
  id: string;
  name: string;
  description?: string;
  level: number;
  isSystem: boolean;
  permissions: {
    permission: Permission;
  }[];
  _count?: {
    users: number;
  };
}

interface UserRole {
  id: string;
  role: Role;
  userType: string;
  createdAt: string;
}

const RBAC = () => {
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions' | 'users'>('roles');
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [showCreatePermissionModal, setShowCreatePermissionModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  useEffect(() => {
    if (activeTab === 'roles') {
      loadRoles();
    } else if (activeTab === 'permissions') {
      loadPermissions();
    }
  }, [activeTab]);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const response = await api.get('/rbac/roles');
      setRoles(response.data);
    } catch (error: any) {
      setError('Erro ao carregar roles');
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/rbac/permissions');
      setPermissions(response.data);
    } catch (error: any) {
      setError('Erro ao carregar permissões');
    } finally {
      setLoading(false);
    }
  };

  const createRole = async (data: { name: string; description: string; level: number }) => {
    try {
      await api.post('/rbac/roles', data);
      setSuccess('Role criada com sucesso!');
      setShowCreateRoleModal(false);
      loadRoles();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erro ao criar role');
    }
  };

  const createPermission = async (data: { resource: string; action: string; description: string }) => {
    try {
      await api.post('/rbac/permissions', data);
      setSuccess('Permissão criada com sucesso!');
      setShowCreatePermissionModal(false);
      loadPermissions();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erro ao criar permissão');
    }
  };

  const deleteRole = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta role?')) return;
    
    try {
      await api.delete(`/rbac/roles/${id}`);
      setSuccess('Role deletada com sucesso!');
      loadRoles();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erro ao deletar role');
    }
  };

  return (
    <div className="rbac-container">
      <div className="rbac-header">
        <div className="header-content">
          <Shield size={32} />
          <div>
            <h1>Gerenciamento de Permissões (RBAC)</h1>
            <p>Controle de Acesso Baseado em Roles - Fase 4</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <CheckCircle size={20} />
          {success}
          <button onClick={() => setSuccess('')}>×</button>
        </div>
      )}

      <div className="rbac-tabs">
        <button
          className={`tab ${activeTab === 'roles' ? 'active' : ''}`}
          onClick={() => setActiveTab('roles')}
        >
          <Shield size={20} />
          Roles
        </button>
        <button
          className={`tab ${activeTab === 'permissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('permissions')}
        >
          <Key size={20} />
          Permissões
        </button>
        <button
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={20} />
          Atribuições
        </button>
      </div>

      <div className="rbac-content">
        {/* TAB: ROLES */}
        {activeTab === 'roles' && (
          <div className="roles-tab">
            <div className="tab-header">
              <h2>Roles do Sistema</h2>
              <button className="btn-primary" onClick={() => setShowCreateRoleModal(true)}>
                <Plus size={20} />
                Nova Role
              </button>
            </div>

            {loading ? (
              <div className="loading">Carregando...</div>
            ) : (
              <div className="roles-grid">
                {roles.map((role) => (
                  <div key={role.id} className="role-card">
                    <div className="role-card-header">
                      <div>
                        <h3>{role.name}</h3>
                        <p>{role.description}</p>
                      </div>
                      <div className="role-level">Nível {role.level}</div>
                    </div>

                    <div className="role-stats">
                      <div className="stat">
                        <Key size={16} />
                        <span>{role.permissions.length} permissões</span>
                      </div>
                      <div className="stat">
                        <Users size={16} />
                        <span>{role._count?.users || 0} usuários</span>
                      </div>
                    </div>

                    <div className="role-permissions">
                      <strong>Permissões:</strong>
                      <div className="permissions-list">
                        {role.permissions.slice(0, 5).map((rp) => (
                          <span key={rp.permission.id} className="permission-badge">
                            {rp.permission.resource}:{rp.permission.action}
                          </span>
                        ))}
                        {role.permissions.length > 5 && (
                          <span className="permission-badge more">
                            +{role.permissions.length - 5} mais
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="role-actions">
                      <button
                        className="btn-icon"
                        onClick={() => setSelectedRole(role)}
                        title="Ver detalhes"
                      >
                        <Edit2 size={16} />
                      </button>
                      {!role.isSystem && (
                        <button
                          className="btn-icon btn-danger"
                          onClick={() => deleteRole(role.id)}
                          title="Deletar"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    {role.isSystem && (
                      <div className="system-badge">Sistema</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: PERMISSIONS */}
        {activeTab === 'permissions' && (
          <div className="permissions-tab">
            <div className="tab-header">
              <h2>Permissões Disponíveis</h2>
              <button className="btn-primary" onClick={() => setShowCreatePermissionModal(true)}>
                <Plus size={20} />
                Nova Permissão
              </button>
            </div>

            {loading ? (
              <div className="loading">Carregando...</div>
            ) : (
              <div className="permissions-table">
                <table>
                  <thead>
                    <tr>
                      <th>Recurso</th>
                      <th>Ação</th>
                      <th>Descrição</th>
                      <th>Roles</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permissions.map((perm) => (
                      <tr key={perm.id}>
                        <td>
                          <code>{perm.resource}</code>
                        </td>
                        <td>
                          <code>{perm.action}</code>
                        </td>
                        <td>{perm.description || '-'}</td>
                        <td>
                          <span className="badge">{perm._count?.roles || 0} roles</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB: USERS */}
        {activeTab === 'users' && (
          <div className="users-tab">
            <div className="tab-header">
              <h2>Atribuições de Roles</h2>
              <p>Gerencie quais usuários têm quais roles</p>
            </div>
            <div className="coming-soon">
              <Users size={48} />
              <h3>Em breve</h3>
              <p>Interface de atribuição de roles a usuários</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Criar Role */}
      {showCreateRoleModal && (
        <div className="modal-overlay" onClick={() => setShowCreateRoleModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Nova Role</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createRole({
                  name: formData.get('name') as string,
                  description: formData.get('description') as string,
                  level: parseInt(formData.get('level') as string)
                });
              }}
            >
              <div className="form-group">
                <label>Nome*</label>
                <input name="name" required placeholder="Ex: COORDENADOR_PEDAGOGICO" />
              </div>
              <div className="form-group">
                <label>Descrição</label>
                <textarea name="description" placeholder="Descrição da role..." />
              </div>
              <div className="form-group">
                <label>Nível (0-100)</label>
                <input name="level" type="number" defaultValue={50} min={0} max={100} />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateRoleModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Criar Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Criar Permissão */}
      {showCreatePermissionModal && (
        <div className="modal-overlay" onClick={() => setShowCreatePermissionModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Nova Permissão</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createPermission({
                  resource: formData.get('resource') as string,
                  action: formData.get('action') as string,
                  description: formData.get('description') as string
                });
              }}
            >
              <div className="form-group">
                <label>Recurso*</label>
                <input name="resource" required placeholder="Ex: alunos, turmas, notas" />
              </div>
              <div className="form-group">
                <label>Ação*</label>
                <input name="action" required placeholder="Ex: create, read, update, delete" />
              </div>
              <div className="form-group">
                <label>Descrição</label>
                <textarea name="description" placeholder="Descrição da permissão..." />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreatePermissionModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Criar Permissão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RBAC;
