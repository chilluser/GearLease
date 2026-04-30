<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Conversation extends Model {
  use HasFactory;

  protected $fillable = ['seller_id','renter_id','message_count','last_message_at'];

  public function seller() { return $this->belongsTo(User::class, 'seller_id'); }
  public function renter() { return $this->belongsTo(User::class, 'renter_id'); }
  public function messages() { return $this->hasMany(Message::class)->orderBy('created_at'); }

  // helper: find or create conversation between seller + renter
  public static function firstOrCreateForUsers(int $sellerId, int $renterId)
  {
      $conv = self::where(function($q) use ($sellerId, $renterId) {
          $q->where('seller_id', $sellerId)->where('renter_id', $renterId);
      })->first();

      if ($conv) return $conv;

      return self::create([
          'seller_id' => $sellerId,
          'renter_id' => $renterId,
      ]);
  }
}