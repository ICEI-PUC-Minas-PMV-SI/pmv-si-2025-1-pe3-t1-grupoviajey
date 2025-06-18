const sitePostsService = require('./sitePostsService');

class SitePostsController {
  /**
   * Criar post
   */
  async createPost(req, res) {
    try {
      const { uid, userType } = req.user;
      const postData = req.body;

      // Verificar se o usuário tem permissão para criar posts
      if (userType !== 'partner' && userType !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Apenas partners e admins podem criar posts'
        });
      }

      const post = await sitePostsService.createPost(uid, userType, postData);
      
      res.status(201).json({
        success: true,
        data: post
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Buscar posts públicos
   */
  async getPublicPosts(req, res) {
    try {
      const posts = await sitePostsService.getPublicPosts();
      
      res.status(200).json({
        success: true,
        data: posts
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Buscar todos os posts (apenas admin)
   */
  async getAllPosts(req, res) {
    try {
      const { userType } = req.user;
      
      if (userType !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado. Apenas admins podem ver todos os posts'
        });
      }

      const posts = await sitePostsService.getPosts();
      
      res.status(200).json({
        success: true,
        data: posts
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Buscar posts do usuário
   */
  async getUserPosts(req, res) {
    try {
      const { uid } = req.user;
      
      const posts = await sitePostsService.getUserPosts(uid);
      
      res.status(200).json({
        success: true,
        data: posts
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Buscar post específico
   */
  async getPost(req, res) {
    try {
      const { postId } = req.params;
      
      const post = await sitePostsService.getPost(postId);
      
      res.status(200).json({
        success: true,
        data: post
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Atualizar post
   */
  async updatePost(req, res) {
    try {
      const { uid, userType } = req.user;
      const { postId } = req.params;
      const updateData = req.body;
      
      const post = await sitePostsService.updatePost(postId, uid, userType, updateData);
      
      res.status(200).json({
        success: true,
        data: post
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Deletar post
   */
  async deletePost(req, res) {
    try {
      const { uid, userType } = req.user;
      const { postId } = req.params;
      
      const result = await sitePostsService.deletePost(postId, uid, userType);
      
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Aprovar post (apenas admin)
   */
  async approvePost(req, res) {
    try {
      const { uid, userType } = req.user;
      const { postId } = req.params;
      
      if (userType !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado. Apenas admins podem aprovar posts'
        });
      }

      const post = await sitePostsService.approvePost(postId, uid);
      
      res.status(200).json({
        success: true,
        data: post
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Rejeitar post (apenas admin)
   */
  async rejectPost(req, res) {
    try {
      const { uid, userType } = req.user;
      const { postId } = req.params;
      const { reason } = req.body;
      
      if (userType !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado. Apenas admins podem rejeitar posts'
        });
      }

      const post = await sitePostsService.rejectPost(postId, uid, reason);
      
      res.status(200).json({
        success: true,
        data: post
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Buscar posts pendentes (apenas admin)
   */
  async getPendingPosts(req, res) {
    try {
      const { userType } = req.user;
      
      if (userType !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado. Apenas admins podem ver posts pendentes'
        });
      }

      const posts = await sitePostsService.getPendingPosts();
      
      res.status(200).json({
        success: true,
        data: posts
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Buscar estatísticas dos posts (apenas admin)
   */
  async getPostsStats(req, res) {
    try {
      const { userType } = req.user;
      
      if (userType !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado. Apenas admins podem ver estatísticas'
        });
      }

      const stats = await sitePostsService.getPostsStats();
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Buscar posts por tags
   */
  async getPostsByTags(req, res) {
    try {
      const { tags } = req.query;
      
      if (!tags) {
        return res.status(400).json({
          success: false,
          message: 'Tags são obrigatórias'
        });
      }

      const tagArray = tags.split(',').map(tag => tag.trim());
      const posts = await sitePostsService.getPostsByTags(tagArray);
      
      res.status(200).json({
        success: true,
        data: posts
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new SitePostsController(); 