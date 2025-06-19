const { db } = require('../../config/firebase');

class SitePostsService {
  /**
   * Criar post
   */
  async createPost(userId, userType, postData) {
    try {
      const postsRef = db.collection('sitePosts');
      
      const post = {
        authorId: userId,
        authorType: userType,
        ...postData,
        status: postData.status || 'draft',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await postsRef.add(post);
      
      return {
        id: docRef.id,
        ...post
      };
    } catch (error) {
      throw new Error(`Erro ao criar post: ${error.message}`);
    }
  }

  /**
   * Buscar todos os posts (com filtros)
   */
  async getPosts(filters = {}) {
    try {
      let query = db.collection('sitePosts');
      
      // Aplicar filtros
      if (filters.status) {
        query = query.where('status', '==', filters.status);
      }
      
      if (filters.authorId) {
        query = query.where('authorId', '==', filters.authorId);
      }
      
      if (filters.authorType) {
        query = query.where('authorType', '==', filters.authorType);
      }

      const snapshot = await query.orderBy('createdAt', 'desc').get();
      
      const posts = [];
      snapshot.forEach(doc => {
        posts.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return posts;
    } catch (error) {
      throw new Error(`Erro ao buscar posts: ${error.message}`);
    }
  }

  /**
   * Buscar posts públicos (aprovados)
   */
  async getPublicPosts() {
    try {
      return await this.getPosts({ status: 'approved' });
    } catch (error) {
      throw new Error(`Erro ao buscar posts públicos: ${error.message}`);
    }
  }

  /**
   * Buscar posts de um usuário específico
   */
  async getUserPosts(userId) {
    try {
      return await this.getPosts({ authorId: userId });
    } catch (error) {
      throw new Error(`Erro ao buscar posts do usuário: ${error.message}`);
    }
  }

  /**
   * Buscar post específico
   */
  async getPost(postId) {
    try {
      const postRef = db.collection('sitePosts').doc(postId);
      const doc = await postRef.get();
      
      if (!doc.exists) {
        throw new Error('Post não encontrado');
      }
      
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      throw new Error(`Erro ao buscar post: ${error.message}`);
    }
  }

  /**
   * Atualizar post
   */
  async updatePost(postId, userId, userType, updateData) {
    try {
      const postRef = db.collection('sitePosts').doc(postId);
      
      // Verificar se o post existe
      const doc = await postRef.get();
      if (!doc.exists) {
        throw new Error('Post não encontrado');
      }
      
      const post = doc.data();
      
      // Verificar permissões: apenas o autor ou admin pode editar
      if (post.authorId !== userId && userType !== 'admin') {
        throw new Error('Acesso negado. Apenas o autor ou admin pode editar o post');
      }

      const update = {
        ...updateData,
        updatedAt: new Date()
      };

      await postRef.update(update);
      
      return await this.getPost(postId);
    } catch (error) {
      throw new Error(`Erro ao atualizar post: ${error.message}`);
    }
  }

  /**
   * Deletar post
   */
  async deletePost(postId, userId, userType) {
    try {
      const postRef = db.collection('sitePosts').doc(postId);
      
      // Verificar se o post existe
      const doc = await postRef.get();
      if (!doc.exists) {
        throw new Error('Post não encontrado');
      }
      
      const post = doc.data();
      
      // Verificar permissões: apenas o autor ou admin pode deletar
      if (post.authorId !== userId && userType !== 'admin') {
        throw new Error('Acesso negado. Apenas o autor ou admin pode deletar o post');
      }

      await postRef.delete();
      
      return { success: true, message: 'Post deletado com sucesso' };
    } catch (error) {
      throw new Error(`Erro ao deletar post: ${error.message}`);
    }
  }

  /**
   * Aprovar post (apenas admin)
   */
  async approvePost(postId, adminId) {
    try {
      const postRef = db.collection('sitePosts').doc(postId);
      
      // Verificar se o post existe
      const doc = await postRef.get();
      if (!doc.exists) {
        throw new Error('Post não encontrado');
      }
      
      const post = doc.data();
      
      if (post.status === 'approved') {
        throw new Error('Post já está aprovado');
      }

      const update = {
        status: 'approved',
        approvedBy: adminId,
        approvedAt: new Date(),
        updatedAt: new Date()
      };

      await postRef.update(update);
      
      return await this.getPost(postId);
    } catch (error) {
      throw new Error(`Erro ao aprovar post: ${error.message}`);
    }
  }

  /**
   * Rejeitar post (apenas admin)
   */
  async rejectPost(postId, adminId, reason = '') {
    try {
      const postRef = db.collection('sitePosts').doc(postId);
      
      // Verificar se o post existe
      const doc = await postRef.get();
      if (!doc.exists) {
        throw new Error('Post não encontrado');
      }
      
      const post = doc.data();
      
      if (post.status === 'rejected') {
        throw new Error('Post já está rejeitado');
      }

      const update = {
        status: 'rejected',
        rejectedBy: adminId,
        rejectedAt: new Date(),
        rejectionReason: reason,
        updatedAt: new Date()
      };

      await postRef.update(update);
      
      return await this.getPost(postId);
    } catch (error) {
      throw new Error(`Erro ao rejeitar post: ${error.message}`);
    }
  }

  /**
   * Buscar posts pendentes de aprovação
   */
  async getPendingPosts() {
    try {
      return await this.getPosts({ status: 'pending' });
    } catch (error) {
      throw new Error(`Erro ao buscar posts pendentes: ${error.message}`);
    }
  }

  /**
   * Buscar estatísticas dos posts
   */
  async getPostsStats() {
    try {
      const allPosts = await this.getPosts();
      
      const stats = {
        total: allPosts.length,
        approved: allPosts.filter(post => post.status === 'approved').length,
        pending: allPosts.filter(post => post.status === 'pending').length,
        rejected: allPosts.filter(post => post.status === 'rejected').length,
        draft: allPosts.filter(post => post.status === 'draft').length,
        byAuthorType: {}
      };

      // Estatísticas por tipo de autor
      allPosts.forEach(post => {
        const authorType = post.authorType || 'unknown';
        stats.byAuthorType[authorType] = (stats.byAuthorType[authorType] || 0) + 1;
      });

      return stats;
    } catch (error) {
      throw new Error(`Erro ao buscar estatísticas dos posts: ${error.message}`);
    }
  }

  /**
   * Buscar posts por tags
   */
  async getPostsByTags(tags) {
    try {
      const allPosts = await this.getPosts({ status: 'approved' });
      
      if (!Array.isArray(tags)) {
        tags = [tags];
      }
      
      const filteredPosts = allPosts.filter(post => {
        if (!post.tags || !Array.isArray(post.tags)) return false;
        return tags.some(tag => post.tags.includes(tag));
      });
      
      return filteredPosts;
    } catch (error) {
      throw new Error(`Erro ao buscar posts por tags: ${error.message}`);
    }
  }
}

module.exports = new SitePostsService(); 