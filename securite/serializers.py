from rest_framework import serializers
from .models import AlerteSecurite


class AlerteSecuriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlerteSecurite
        fields = '__all__'
