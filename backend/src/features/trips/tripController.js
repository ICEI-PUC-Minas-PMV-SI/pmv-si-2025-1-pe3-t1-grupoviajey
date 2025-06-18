const tripService = require('./tripService');

class TripController {
  /**
   * Criar nova viagem
   */
  async createTrip(req, res) {
    try {
      const { uid } = req.user;
      const tripData = req.body;

      const trip = await tripService.createTrip(uid, tripData);
      
      res.status(201).json({
        success: true,
        data: trip
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Buscar todas as viagens do usuário
   */
  async getUserTrips(req, res) {
    try {
      const { uid } = req.user;
      
      const trips = await tripService.getUserTrips(uid);
      
      res.status(200).json({
        success: true,
        data: trips
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Buscar viagem específica
   */
  async getTrip(req, res) {
    try {
      const { uid } = req.user;
      const { tripId } = req.params;
      
      const trip = await tripService.getTrip(uid, tripId);
      
      res.status(200).json({
        success: true,
        data: trip
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Atualizar viagem
   */
  async updateTrip(req, res) {
    try {
      const { uid } = req.user;
      const { tripId } = req.params;
      const updateData = req.body;
      
      const trip = await tripService.updateTrip(uid, tripId, updateData);
      
      res.status(200).json({
        success: true,
        data: trip
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Deletar viagem
   */
  async deleteTrip(req, res) {
    try {
      const { uid } = req.user;
      const { tripId } = req.params;
      
      const result = await tripService.deleteTrip(uid, tripId);
      
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
}

module.exports = new TripController(); 