const API_URL = 'https://sua-api.com/api/roadmaps';

export async function fetchUserTrips(userId) {
    try {
        const res = await fetch(`${API_URL}/user/${userId}`);
        if (!res.ok) throw new Error('Erro ao buscar viagens');
        return await res.json();
    } catch (err) {
        console.error(err);
        // fallback: return localStorage mock
        return JSON.parse(localStorage.getItem('userTrips') || '[]');
    }
}

export async function fetchTripById(tripId) {
    try {
        const res = await fetch(`${API_URL}/${tripId}`);
        if (!res.ok) throw new Error('Erro ao buscar viagem');
        return await res.json();
    } catch (err) {
        console.error(err);
        // fallback: buscar no localStorage
        const trips = JSON.parse(localStorage.getItem('userTrips') || '[]');
        return trips.find(t => String(t.id) === String(tripId));
    }
}

export async function createTrip(tripData) {
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tripData)
        });
        if (!res.ok) throw new Error('Erro ao criar viagem');
        return await res.json();
    } catch (err) {
        console.error(err);
        // fallback: salvar no localStorage
        const trips = JSON.parse(localStorage.getItem('userTrips') || '[]');
        trips.push(tripData);
        localStorage.setItem('userTrips', JSON.stringify(trips));
        return tripData;
    }
}

export async function updateTrip(tripId, updateData) {
    try {
        const res = await fetch(`${API_URL}/${tripId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
        });
        if (!res.ok) throw new Error('Erro ao atualizar viagem');
        return await res.json();
    } catch (err) {
        console.error(err);
        // fallback: atualizar no localStorage
        const trips = JSON.parse(localStorage.getItem('userTrips') || '[]');
        const idx = trips.findIndex(t => String(t.id) === String(tripId));
        if (idx !== -1) {
            trips[idx] = { ...trips[idx], ...updateData };
            localStorage.setItem('userTrips', JSON.stringify(trips));
            return trips[idx];
        }
        return null;
    }
}

export async function deleteTrip(tripId) {
    try {
        const res = await fetch(`${API_URL}/${tripId}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Erro ao deletar viagem');
        return true;
    } catch (err) {
        console.error(err);
        // fallback: remover do localStorage
        let trips = JSON.parse(localStorage.getItem('userTrips') || '[]');
        trips = trips.filter(t => String(t.id) !== String(tripId));
        localStorage.setItem('userTrips', JSON.stringify(trips));
        return true;
    }
}

// Exemplo de atualização de campo específico
export async function updateTripField(tripId, field, value) {
    return updateTrip(tripId, { [field]: value });
}

// ... outros métodos: updateTrip, deleteTrip, fetchTripById, etc.
